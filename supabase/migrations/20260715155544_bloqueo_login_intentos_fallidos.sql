begin;

-- Contador de intentos de login fallidos por usuario, consultado y actualizado
-- exclusivamente por public.hook_rate_limit_password() (Auth Hook "Password
-- Verification Attempt"). GoTrue llama a ese hook de forma sincrónica en cada
-- intento de signInWithPassword, ANTES de emitir sesión, sea la contraseña
-- correcta o no — por eso el bloqueo no se puede saltear llamando a la API de
-- Auth directamente, a diferencia de un rate limit implementado en el cliente.
create table public.intentos_login_fallidos (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  intentos int not null default 0,
  bloqueado_hasta timestamptz,
  actualizado_en timestamptz not null default now()
);

alter table public.intentos_login_fallidos enable row level security;

-- Sin políticas: RLS deniega todo por defecto. Además revocamos los grants de
-- tabla explícitamente porque el proyecto hosted de Supabase trae grants
-- amplios a anon/authenticated por defecto (ver nota en CLAUDE.md sobre
-- "Local dev != remote unless you grant explicitly") — sin este revoke, un
-- cliente con la anon key podría leer o resetear su propio contador de
-- bloqueo directamente por PostgREST.
revoke all on table public.intentos_login_fallidos from anon, authenticated;

create or replace function public.hook_rate_limit_password(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  max_intentos constant int := 5;
  duracion_bloqueo constant interval := interval '15 minutes';
  v_usuario_id uuid := (event->>'user_id')::uuid;
  v_valido boolean := (event->>'valid')::boolean;
  v_bloqueado_hasta timestamptz;
  v_intentos int;
begin
  select bloqueado_hasta
    into v_bloqueado_hasta
  from public.intentos_login_fallidos
  where usuario_id = v_usuario_id
  for update;

  if v_bloqueado_hasta is not null and v_bloqueado_hasta > now() then
    return jsonb_build_object(
      'decision', 'reject',
      'message', format(
        'Demasiados intentos fallidos. Intenta de nuevo en %s minuto(s).',
        greatest(1, ceil(extract(epoch from (v_bloqueado_hasta - now())) / 60))
      )
    );
  end if;

  if v_valido then
    delete from public.intentos_login_fallidos where usuario_id = v_usuario_id;
    return jsonb_build_object('decision', 'continue');
  end if;

  insert into public.intentos_login_fallidos as t (usuario_id, intentos, actualizado_en)
  values (v_usuario_id, 1, now())
  on conflict (usuario_id) do update
    set intentos = intentos_login_fallidos.intentos + 1,
        actualizado_en = now()
  returning intentos_login_fallidos.intentos into v_intentos;

  if v_intentos >= max_intentos then
    update public.intentos_login_fallidos
    set bloqueado_hasta = now() + duracion_bloqueo
    where usuario_id = v_usuario_id;

    return jsonb_build_object(
      'decision', 'reject',
      'message', 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente por 15 minutos.'
    );
  end if;

  return jsonb_build_object('decision', 'continue');
end;
$$;

revoke execute on function public.hook_rate_limit_password(jsonb) from public, anon, authenticated;
grant execute on function public.hook_rate_limit_password(jsonb) to supabase_auth_admin;

commit;
