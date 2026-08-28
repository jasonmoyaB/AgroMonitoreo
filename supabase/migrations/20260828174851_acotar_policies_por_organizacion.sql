-- Re-ancla toda la RLS a la organizacion. Es el corazon del aislamiento multi-empresa:
-- hasta aca las policies asumian un solo dueno, asi que tres reglas quedaban sin alcance y
-- con dos clientes se vuelven fugas.
--
--   1. private.es_admin_oficina() es un booleano global: la rama del admin no acotaba
--      nada, asi que un admin leia planilla, salarios y cedulas de los demas clientes.
--   2. trabajadores_select_activos_finca_o_admin tiene una rama `activo = true` sin
--      scoping, abierta a proposito para que traslados liste trabajadores de otras fincas
--      (20260724174931). Eso exponia nombre, foto y `asegurado` de todo trabajador activo
--      de todo cliente a cualquier usuario autenticado.
--   3. fincas_select_activas_o_admin es `activa = true`: todo usuario veia las fincas de
--      todos los clientes.
--
-- El patron de reemplazo es siempre el mismo: donde habia una rama sin alcance, se le suma
-- la pertenencia a la organizacion. Se mantienen las dos reglas de 20260818184228: una
-- sola policy permissive por tabla y accion (advisor 0006), y toda llamada envuelta en
-- (select ...) para que se resuelva como InitPlan una sola vez y no por fila (advisor 0003).
--
-- Las policies de insert/delete que ya comparaban finca_id = private.finca_del_usuario()
-- NO se tocan: esa comparacion es exacta y una finca pertenece a una sola organizacion, asi
-- que ya eran seguras entre clientes. Solo cambian las ramas que no tenian limite.

begin;

-- ---------------------------------------------------------------------------
-- Helper: las fincas que alcanza mi organizacion
-- ---------------------------------------------------------------------------
-- security definer es lo que evita la recursion al usarla dentro de una policy sobre la
-- propia tabla fincas: el cuerpo corre sin RLS. Mismo motivo por el que existe
-- private.es_admin_oficina() (20260803232810).
--
-- Con organizacion null devuelve el conjunto vacio, o sea que el default para un invitado
-- sin asignar es no ver nada.
create or replace function private.fincas_de_mi_organizacion()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select f.id
  from public.fincas f
  where f.organizacion_id = private.organizacion_del_usuario();
$$;

revoke execute on function private.fincas_de_mi_organizacion() from public, anon;
grant execute on function private.fincas_de_mi_organizacion() to authenticated;

-- ---------------------------------------------------------------------------
-- fincas
-- ---------------------------------------------------------------------------
-- `activa = true` deja de alcanzar: ahora hay que pertenecer. Se conserva la distincion
-- que ya existia — el supervisor solo ve las activas, el admin tambien las inactivas
-- (20260714224512) — pero las dos ramas dentro de la organizacion.
drop policy if exists fincas_select_activas_o_admin on public.fincas;
drop policy if exists fincas_insert_admin_oficina on public.fincas;
drop policy if exists fincas_update_admin_oficina on public.fincas;

create policy fincas_select_mi_organizacion on public.fincas
  for select to authenticated
  using (
    organizacion_id = (select private.organizacion_del_usuario())
    and (activa = true or (select private.es_admin_oficina()))
  );

-- El with check sobre organizacion_id es lo que impide que un admin cree una finca dentro
-- de otro cliente, y en el update, que se lleve una finca a otra organizacion.
create policy fincas_insert_admin_mi_organizacion on public.fincas
  for insert to authenticated
  with check (
    (select private.es_admin_oficina())
    and organizacion_id = (select private.organizacion_del_usuario())
  );

create policy fincas_update_admin_mi_organizacion on public.fincas
  for update to authenticated
  using (
    (select private.es_admin_oficina())
    and organizacion_id = (select private.organizacion_del_usuario())
  )
  with check (
    (select private.es_admin_oficina())
    and organizacion_id = (select private.organizacion_del_usuario())
  );

-- ---------------------------------------------------------------------------
-- usuario
-- ---------------------------------------------------------------------------
-- La rama del admin alcanzaba la tabla entera. usuario guarda la PII del operador
-- (cedula, direccion, fecha_nacimiento, telefono, email_contacto), asi que sin alcance un
-- admin leia los datos personales de los empleados de otro cliente. Y el update dejaba
-- editarles rol_id y finca_id.
drop policy if exists usuario_select_own_o_admin on public.usuario;
drop policy if exists usuario_update_own_o_admin on public.usuario;

create policy usuario_select_own_o_admin_mi_organizacion on public.usuario
  for select to authenticated
  using (
    (auth_user_id = (select auth.uid()) and activo = true)
    or (
      (select private.es_admin_oficina())
      and organizacion_id = (select private.organizacion_del_usuario())
    )
  );

-- El with check sobre organizacion_id impide que un admin se traiga un usuario de otro
-- cliente a su organizacion con un update. El trigger de escalada ademas prohibe mover la
-- columna en cualquier direccion, incluso al propio admin.
create policy usuario_update_own_o_admin_mi_organizacion on public.usuario
  for update to authenticated
  using (
    auth_user_id = (select auth.uid())
    or (
      (select private.es_admin_oficina())
      and organizacion_id = (select private.organizacion_del_usuario())
    )
  )
  with check (
    auth_user_id = (select auth.uid())
    or (
      (select private.es_admin_oficina())
      and organizacion_id = (select private.organizacion_del_usuario())
    )
  );

-- ---------------------------------------------------------------------------
-- trabajadores
-- ---------------------------------------------------------------------------
-- Las tres ramas se conservan con la misma forma que tenian; lo unico que cambia es que
-- las dos que no tenian limite ahora lo tienen:
--   - mi finca (activos e inactivos): ya era exacta, no se toca.
--   - activos de otras fincas: era `activo = true` a secas. Traslados lo necesita, pero
--     solo dentro de la organizacion.
--   - admin: era global.
drop policy if exists trabajadores_select_activos_finca_o_admin on public.trabajadores;
drop policy if exists trabajadores_update_finca_o_admin on public.trabajadores;

create policy trabajadores_select_mi_organizacion on public.trabajadores
  for select to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (
      (activo = true or (select private.es_admin_oficina()))
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

create policy trabajadores_update_finca_o_admin_mi_organizacion on public.trabajadores
  for update to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  )
  with check (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

-- ---------------------------------------------------------------------------
-- datos_trabajadores  (cedula, fecha_ingreso, telefono)
-- ---------------------------------------------------------------------------
drop policy if exists datos_trabajadores_finca_o_admin on public.datos_trabajadores;

create policy datos_trabajadores_finca_o_admin_mi_organizacion on public.datos_trabajadores
  for all to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  )
  with check (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

-- ---------------------------------------------------------------------------
-- salarios_trabajadores
-- ---------------------------------------------------------------------------
-- Unica tabla del esquema sin finca_id: se ancla por trabajador (20260728100100). Sin este
-- scoping, un admin leia el salario mensual de los trabajadores de otro cliente, que es
-- exactamente el dato que esa migracion saco de trabajadores para que no viajara de mas.
drop policy if exists salarios_trabajadores_admin_oficina on public.salarios_trabajadores;

create policy salarios_trabajadores_admin_mi_organizacion on public.salarios_trabajadores
  for all to authenticated
  using (
    (select private.es_admin_oficina())
    and trabajador_id in (
      select t.id from public.trabajadores t
      where t.finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  )
  with check (
    (select private.es_admin_oficina())
    and trabajador_id in (
      select t.id from public.trabajadores t
      where t.finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

-- ---------------------------------------------------------------------------
-- pagos_quincenales
-- ---------------------------------------------------------------------------
-- Sigue sin policy de update ni delete, a proposito: una quincena pagada no se corrige
-- editando el pasado (decision 4).
drop policy if exists pagos_quincenales_select_admin_oficina on public.pagos_quincenales;
drop policy if exists pagos_quincenales_insert_admin_oficina on public.pagos_quincenales;

create policy pagos_quincenales_select_admin_mi_organizacion on public.pagos_quincenales
  for select to authenticated
  using (
    (select private.es_admin_oficina())
    and finca_id in (select * from private.fincas_de_mi_organizacion())
  );

create policy pagos_quincenales_insert_admin_mi_organizacion on public.pagos_quincenales
  for insert to authenticated
  with check (
    (select private.es_admin_oficina())
    and finca_id in (select * from private.fincas_de_mi_organizacion())
  );

-- ---------------------------------------------------------------------------
-- registros_trabajo
-- ---------------------------------------------------------------------------
drop policy if exists registros_trabajo_select_finca_o_admin on public.registros_trabajo;

create policy registros_trabajo_select_finca_o_admin_mi_org on public.registros_trabajo
  for select to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

-- ---------------------------------------------------------------------------
-- asistencia
-- ---------------------------------------------------------------------------
drop policy if exists asistencia_select_finca_o_admin on public.asistencia;

create policy asistencia_select_finca_o_admin_mi_organizacion on public.asistencia
  for select to authenticated
  using (
    finca_id = (select private.finca_del_usuario())
    or (
      (select private.es_admin_oficina())
      and finca_id in (select * from private.fincas_de_mi_organizacion())
    )
  );

-- ---------------------------------------------------------------------------
-- traslados_trabajadores
-- ---------------------------------------------------------------------------
-- Un traslado que cruce organizaciones seria mezcla total: las horas y la produccion del
-- trabajador quedarian en los registros de una empresa que no es la suya. Se exige que las
-- dos fincas esten en la organizacion, en select, en insert y en la resolucion.
drop policy if exists traslados_trabajadores_select_involucrados on public.traslados_trabajadores;
drop policy if exists traslados_trabajadores_insert_supervisor_destino on public.traslados_trabajadores;
drop policy if exists traslados_trabajadores_update_admin_oficina on public.traslados_trabajadores;

create policy traslados_select_involucrados_mi_organizacion on public.traslados_trabajadores
  for select to authenticated
  using (
    finca_origen_id in (select * from private.fincas_de_mi_organizacion())
    and finca_destino_id in (select * from private.fincas_de_mi_organizacion())
    and (
      (select private.finca_del_usuario()) in (finca_origen_id, finca_destino_id)
      or (select private.es_admin_oficina())
    )
  );

-- finca_destino_id = finca_del_usuario() ya implica que el destino es de mi organizacion;
-- lo que faltaba era acotar el origen.
create policy traslados_insert_supervisor_destino_mi_organizacion on public.traslados_trabajadores
  for insert to authenticated
  with check (
    estado = 'pendiente'
    and finca_destino_id = (select private.finca_del_usuario())
    and finca_origen_id in (select * from private.fincas_de_mi_organizacion())
    and exists (
      select 1
      from public.trabajadores t
      where t.id = trabajador_id
        and t.finca_id = finca_origen_id
    )
  );

create policy traslados_update_admin_mi_organizacion on public.traslados_trabajadores
  for update to authenticated
  using (
    estado = 'pendiente'
    and (select private.es_admin_oficina())
    and finca_origen_id in (select * from private.fincas_de_mi_organizacion())
    and finca_destino_id in (select * from private.fincas_de_mi_organizacion())
  )
  with check (estado in ('aprobado', 'rechazado'));

commit;
