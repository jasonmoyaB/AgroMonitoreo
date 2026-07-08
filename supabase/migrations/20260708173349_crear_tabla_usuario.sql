begin;

create table public.usuario (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  rol_id uuid not null references public.roles(id),
  finca_id text not null references public.fincas(id) default 'birrisito',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index usuario_finca_activo_idx
  on public.usuario (finca_id, activo);

create index usuario_rol_idx
  on public.usuario (rol_id);

alter table public.usuario enable row level security;

create policy "usuario_select_own"
  on public.usuario
  for select
  to authenticated
  using (auth_user_id = auth.uid() and activo = true);

create or replace function public.crear_usuario_desde_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rol_nombre text;
  usuario_rol_id uuid;
  usuario_finca_id text;
begin
  rol_nombre := coalesce(nullif(new.raw_user_meta_data->>'rol', ''), 'supervisor');
  usuario_finca_id := coalesce(nullif(new.raw_user_meta_data->>'finca_id', ''), 'birrisito');

  select roles.id
    into usuario_rol_id
  from public.roles
  where roles.nombre = rol_nombre;

  if usuario_rol_id is null then
    raise exception 'Rol de usuario no encontrado: %', rol_nombre;
  end if;

  insert into public.usuario (auth_user_id, email, rol_id, finca_id)
  values (new.id, new.email, usuario_rol_id, usuario_finca_id);

  return new;
end;
$$;

create trigger crear_usuario_despues_de_auth
  after insert on auth.users
  for each row execute function public.crear_usuario_desde_auth();

commit;
