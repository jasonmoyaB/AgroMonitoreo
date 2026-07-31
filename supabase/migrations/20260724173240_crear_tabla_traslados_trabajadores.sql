begin;

-- prestamo de un trabajador a otra finca por un solo dia (fecha). el trabajador
-- nunca cambia de finca_id: al terminar el dia simplemente deja de aparecer
-- prestado (no hay "devolucion" que ejecutar, es automatico por scoping de fecha).
create table public.traslados_trabajadores (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references public.trabajadores(id),
  finca_origen_id text not null references public.fincas(id),
  finca_destino_id text not null references public.fincas(id),
  fecha date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  solicitado_por uuid not null references public.usuario(id) default public.usuario_actual_id(),
  resuelto_por uuid references public.usuario(id),
  resuelto_en timestamptz,
  creado_en timestamptz not null default now(),
  constraint traslados_trabajadores_fincas_distintas check (finca_origen_id <> finca_destino_id)
);

-- unico solo mientras la solicitud sigue activa (pendiente/aprobada): un rechazo
-- no debe bloquear volver a pedir el mismo trabajador para el mismo dia
create unique index traslados_trabajadores_activo_unico_por_dia
  on public.traslados_trabajadores (trabajador_id, fecha)
  where estado in ('pendiente', 'aprobado');

create index traslados_trabajadores_destino_fecha_idx
  on public.traslados_trabajadores (finca_destino_id, fecha);

create index traslados_trabajadores_origen_fecha_idx
  on public.traslados_trabajadores (finca_origen_id, fecha);

-- no confiar en el cliente para quien/cuando resolvio la solicitud (mismo motivo
-- que crear_usuario_desde_auth: un campo de auditoria no puede ser client-supplied)
create function public.resolver_traslado_trabajador()
returns trigger
language plpgsql
security invoker
as $$
begin
  if new.estado <> 'pendiente' and old.estado = 'pendiente' then
    new.resuelto_por := public.usuario_actual_id();
    new.resuelto_en := now();
  end if;
  return new;
end;
$$;

create trigger traslados_trabajadores_resolver
  before update on public.traslados_trabajadores
  for each row
  execute function public.resolver_traslado_trabajador();

alter table public.traslados_trabajadores enable row level security;

-- select: cualquiera de las dos fincas involucradas ve la solicitud, o admin_oficina (todas)
create policy "traslados_trabajadores_select_involucrados"
  on public.traslados_trabajadores
  for select
  to authenticated
  using (
    exists (
      select 1 from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id in (traslados_trabajadores.finca_origen_id, traslados_trabajadores.finca_destino_id)
    )
    or exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

-- insert: el supervisor solo pide para SU finca (destino), sobre un trabajador que
-- realmente pertenece hoy a la finca_origen indicada, y siempre arranca en pendiente
create policy "traslados_trabajadores_insert_supervisor_destino"
  on public.traslados_trabajadores
  for insert
  to authenticated
  with check (
    estado = 'pendiente'
    and exists (
      select 1 from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id = traslados_trabajadores.finca_destino_id
    )
    and exists (
      select 1 from public.trabajadores
      where trabajadores.id = traslados_trabajadores.trabajador_id
        and trabajadores.finca_id = traslados_trabajadores.finca_origen_id
    )
  );

-- update: solo admin_oficina resuelve (aprueba/rechaza), y solo mientras siga pendiente
create policy "traslados_trabajadores_update_admin_oficina"
  on public.traslados_trabajadores
  for update
  to authenticated
  using (
    estado = 'pendiente'
    and exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  )
  with check (estado in ('aprobado', 'rechazado'));

grant select, insert, update on table public.traslados_trabajadores to authenticated;

commit;
