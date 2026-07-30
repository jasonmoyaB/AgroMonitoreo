begin;

-- la quincena pagada es un registro financiero, no una vista sobre salarios_trabajadores:
-- monto y moneda son un SNAPSHOT del momento del pago. si el admin sube el salario en
-- agosto, las quincenas de julio ya pagadas no se mueven.
-- corte confirmado con el usuario: 1-15 y 16-fin de mes (24 pagos al anio).
-- el monto no se deriva de horas ni de cantidad: es salario_mensual / 2, redondeado
-- segun la moneda (colones al entero, usd a 2 decimales).
create table public.pagos_quincenales (
  id uuid primary key default gen_random_uuid(),
  finca_id text not null references public.fincas(id),
  trabajador_id uuid not null references public.trabajadores(id),
  quincena_inicio date not null,
  quincena_fin date not null,
  monto numeric(10, 2) not null check (monto >= 0),
  moneda text not null check (moneda in ('usd', 'colones')),
  registrado_por uuid not null references public.usuario(id) default public.usuario_actual_id(),
  creado_en timestamptz not null default now(),
  constraint pagos_quincenales_rango_valido check (quincena_fin > quincena_inicio),
  constraint pagos_quincenales_una_vez_por_quincena unique (trabajador_id, quincena_inicio)
);

create index pagos_quincenales_finca_quincena_idx
  on public.pagos_quincenales (finca_id, quincena_inicio);

alter table public.pagos_quincenales enable row level security;

-- mismo alcance que salarios_trabajadores (20260728100100): solo admin_oficina, cross-finca
-- por diseno (un dueno, varias fincas). el supervisor no toca planilla en ningun verbo.
create policy "pagos_quincenales_select_admin_oficina"
  on public.pagos_quincenales
  for select
  to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

create policy "pagos_quincenales_insert_admin_oficina"
  on public.pagos_quincenales
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

-- a proposito no hay policy de update ni de delete: una quincena pagada no se corrige
-- editando el pasado, se corrige con un ajuste nuevo.
-- el grant sobre los verbos sobrantes se acota en 20260729163900.
grant select, insert on table public.pagos_quincenales to authenticated;

-- salarios_trabajadores.actualizado_en lo mandaba el cliente (salarios-service.ts).
-- un campo de auditoria no lo sella quien lo escribe: mismo motivo que
-- resolver_traslado_trabajador() y crear_usuario_desde_auth().
create function public.tocar_actualizado_en()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger salarios_trabajadores_tocar_actualizado_en
  before update on public.salarios_trabajadores
  for each row
  execute function public.tocar_actualizado_en();

commit;
