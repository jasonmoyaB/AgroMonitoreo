-- Cierra los advisors de performance 0003 (auth_rls_initplan) y 0006 (multiple_permissive_policies).
--
-- 0003: auth.uid() suelto se re-evalua por fila. Envuelto en (select ...) el planner lo trata
--       como InitPlan y lo calcula una sola vez por query.
-- 0006: dos policies permissive para el mismo rol y accion obligan a correr las dos por fila.
--       Se fusionan con OR en una sola, que da exactamente el mismo conjunto de filas
--       (Postgres ya OR-eaba los USING entre si y los WITH CHECK entre si).
--
-- De paso, el EXISTS correlacionado contra usuario que estaba copiado en diez policies pasa a
-- private.finca_del_usuario(), simetrico a private.es_admin_oficina() (ver 20260803232810):
-- schema private para que PostgREST no lo exponga, SECURITY DEFINER para no re-disparar la RLS
-- de usuario, y search_path vacio con el cuerpo calificado.
--
-- finca_id de usuario es nullable (invitado sin finca asignada, 20260817164409): la funcion
-- devuelve null y `<tabla>.finca_id = null` es null, o sea false. Mismo resultado que el EXISTS.

begin;

create or replace function private.finca_del_usuario()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.finca_id
  from public.usuario u
  where u.auth_user_id = auth.uid()
    and u.activo = true;
$$;

revoke execute on function private.finca_del_usuario() from public, anon;
grant execute on function private.finca_del_usuario() to authenticated;

-- asistencia -----------------------------------------------------------------

drop policy if exists asistencia_select_own_finca on public.asistencia;
drop policy if exists asistencia_select_admin_oficina on public.asistencia;
drop policy if exists asistencia_insert_own_finca on public.asistencia;
drop policy if exists asistencia_delete_own_finca on public.asistencia;

create policy asistencia_select_finca_o_admin on public.asistencia
  for select to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  );

create policy asistencia_insert_own_finca on public.asistencia
  for insert to authenticated
  with check (finca_id = (select private.finca_del_usuario()));

create policy asistencia_delete_own_finca on public.asistencia
  for delete to authenticated
  using (finca_id = (select private.finca_del_usuario()));

-- datos_trabajadores ---------------------------------------------------------

drop policy if exists datos_trabajadores_own_finca on public.datos_trabajadores;
drop policy if exists datos_trabajadores_admin_oficina on public.datos_trabajadores;

create policy datos_trabajadores_finca_o_admin on public.datos_trabajadores
  for all to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  )
  with check (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  );

-- fincas ---------------------------------------------------------------------

drop policy if exists fincas_select_authenticated on public.fincas;
drop policy if exists fincas_select_admin_oficina on public.fincas;
drop policy if exists fincas_insert_admin_oficina on public.fincas;
drop policy if exists fincas_update_admin_oficina on public.fincas;

create policy fincas_select_activas_o_admin on public.fincas
  for select to authenticated
  using (activa = true or (select private.es_admin_oficina()));

create policy fincas_insert_admin_oficina on public.fincas
  for insert to authenticated
  with check ((select private.es_admin_oficina()));

create policy fincas_update_admin_oficina on public.fincas
  for update to authenticated
  using ((select private.es_admin_oficina()))
  with check ((select private.es_admin_oficina()));

-- pagos_quincenales ----------------------------------------------------------

drop policy if exists pagos_quincenales_select_admin_oficina on public.pagos_quincenales;
drop policy if exists pagos_quincenales_insert_admin_oficina on public.pagos_quincenales;

create policy pagos_quincenales_select_admin_oficina on public.pagos_quincenales
  for select to authenticated
  using ((select private.es_admin_oficina()));

create policy pagos_quincenales_insert_admin_oficina on public.pagos_quincenales
  for insert to authenticated
  with check ((select private.es_admin_oficina()));

-- registros_trabajo ----------------------------------------------------------

drop policy if exists registros_trabajo_select_own_finca on public.registros_trabajo;
drop policy if exists registros_trabajo_select_admin_oficina on public.registros_trabajo;
drop policy if exists registros_trabajo_insert_own_finca on public.registros_trabajo;
drop policy if exists registros_trabajo_update_own_finca on public.registros_trabajo;

create policy registros_trabajo_select_finca_o_admin on public.registros_trabajo
  for select to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  );

create policy registros_trabajo_insert_own_finca on public.registros_trabajo
  for insert to authenticated
  with check (finca_id = (select private.finca_del_usuario()));

create policy registros_trabajo_update_own_finca on public.registros_trabajo
  for update to authenticated
  using (finca_id = (select private.finca_del_usuario()))
  with check (finca_id = (select private.finca_del_usuario()));

-- salarios_trabajadores ------------------------------------------------------

drop policy if exists salarios_trabajadores_admin_oficina on public.salarios_trabajadores;

create policy salarios_trabajadores_admin_oficina on public.salarios_trabajadores
  for all to authenticated
  using ((select private.es_admin_oficina()))
  with check ((select private.es_admin_oficina()));

-- trabajadores ---------------------------------------------------------------
-- select_activos_multi_finca abre los activos sin scoping a proposito: traslados necesita
-- listar trabajadores de otras fincas (20260724174931). Las otras dos sumaban los inactivos
-- de la finca propia y los del admin.

drop policy if exists trabajadores_select_activos_multi_finca on public.trabajadores;
drop policy if exists trabajadores_select_own_finca on public.trabajadores;
drop policy if exists trabajadores_select_admin_oficina on public.trabajadores;
drop policy if exists trabajadores_update_own_finca on public.trabajadores;
drop policy if exists trabajadores_update_admin_oficina on public.trabajadores;
drop policy if exists trabajadores_insert_own_finca on public.trabajadores;

create policy trabajadores_select_activos_finca_o_admin on public.trabajadores
  for select to authenticated
  using (
    activo = true
    or finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  );

create policy trabajadores_insert_own_finca on public.trabajadores
  for insert to authenticated
  with check (finca_id = (select private.finca_del_usuario()));

create policy trabajadores_update_finca_o_admin on public.trabajadores
  for update to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  )
  with check (
    finca_id = (select private.finca_del_usuario())
    or (select private.es_admin_oficina())
  );

-- traslados_trabajadores -----------------------------------------------------

drop policy if exists traslados_trabajadores_select_involucrados on public.traslados_trabajadores;
drop policy if exists traslados_trabajadores_insert_supervisor_destino on public.traslados_trabajadores;
drop policy if exists traslados_trabajadores_update_admin_oficina on public.traslados_trabajadores;

create policy traslados_trabajadores_select_involucrados on public.traslados_trabajadores
  for select to authenticated
  using (
    (select private.finca_del_usuario()) in (finca_origen_id, finca_destino_id)
    or (select private.es_admin_oficina())
  );

create policy traslados_trabajadores_insert_supervisor_destino on public.traslados_trabajadores
  for insert to authenticated
  with check (
    estado = 'pendiente'
    and finca_destino_id = (select private.finca_del_usuario())
    and exists (
      select 1
      from public.trabajadores t
      where t.id = trabajador_id
        and t.finca_id = finca_origen_id
    )
  );

create policy traslados_trabajadores_update_admin_oficina on public.traslados_trabajadores
  for update to authenticated
  using (estado = 'pendiente' and (select private.es_admin_oficina()))
  with check (estado in ('aprobado', 'rechazado'));

-- usuario --------------------------------------------------------------------

drop policy if exists usuario_select_own on public.usuario;
drop policy if exists usuario_select_admin_oficina on public.usuario;
drop policy if exists usuario_update_own on public.usuario;
drop policy if exists usuario_update_admin_oficina on public.usuario;

create policy usuario_select_own_o_admin on public.usuario
  for select to authenticated
  using (
    (auth_user_id = (select auth.uid()) and activo = true)
    or (select private.es_admin_oficina())
  );

create policy usuario_update_own_o_admin on public.usuario
  for update to authenticated
  using (
    auth_user_id = (select auth.uid())
    or (select private.es_admin_oficina())
  )
  with check (
    auth_user_id = (select auth.uid())
    or (select private.es_admin_oficina())
  );

commit;
