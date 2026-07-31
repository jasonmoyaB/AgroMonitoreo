begin;

-- trabajadores_select_own_finca (20260708181240) dejo a los supervisores sin poder
-- ver trabajadores de otras fincas, pero el flujo de traslados necesita mostrarlos
-- para elegir a quien pedir prestado. nombre/foto no son datos sensibles aqui
-- (ya se sirven publicos via la url del bucket trabajador-fotos), asi que basta con
-- una policy adicional (permissive, se OR-ea con la existente) para activo = true.
create policy "trabajadores_select_activos_multi_finca"
  on public.trabajadores
  for select
  to authenticated
  using (activo = true);

commit;
