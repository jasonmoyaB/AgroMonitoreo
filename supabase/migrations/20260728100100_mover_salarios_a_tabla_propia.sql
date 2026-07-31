begin;

-- RLS es row-level, no column-level. mientras salario_mensual/moneda vivan en
-- trabajadores quedan expuestos por dos policies preexistentes:
--   trabajadores_select_activos_multi_finca (20260724174931) -> using (activo = true),
--     abierta a toda la tabla para que traslados pueda listar trabajadores de otras
--     fincas: cualquier supervisor lee la planilla completa de todas las fincas.
--   trabajadores_update_own_finca (20260708181240) -> el supervisor puede escribir
--     el salario de cualquier trabajador de su finca.
-- agregar trabajadores_update_admin_oficina (20260727160516) no arregla nada: las
-- policies permissive se OR-ean, solo amplian. la unica forma de acotar por columna
-- es que la columna viva en otra tabla con su propia RLS.
create table public.salarios_trabajadores (
  trabajador_id uuid primary key references public.trabajadores(id) on delete cascade,
  salario_mensual numeric(10, 2) not null default 0 check (salario_mensual >= 0),
  moneda text not null default 'colones' check (moneda in ('usd', 'colones')),
  actualizado_en timestamptz not null default now()
);

insert into public.salarios_trabajadores (trabajador_id, salario_mensual, moneda)
  select id, salario_mensual, moneda from public.trabajadores;

alter table public.trabajadores
  drop column salario_mensual,
  drop column moneda;

alter table public.salarios_trabajadores enable row level security;

-- solo admin_oficina, y en todo verbo: no hay caso de uso donde el supervisor lea o
-- escriba planilla. el admin lee cross-finca por diseno (un dueno, varias fincas).
create policy "salarios_trabajadores_admin_oficina"
  on public.salarios_trabajadores
  for all
  to authenticated
  using (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  )
  with check (
    exists (
      select 1 from public.usuario u
      join public.roles r on r.id = u.rol_id
      where u.auth_user_id = auth.uid() and u.activo = true and r.nombre = 'admin_oficina'
    )
  );

grant select, insert, update on table public.salarios_trabajadores to authenticated;

commit;
