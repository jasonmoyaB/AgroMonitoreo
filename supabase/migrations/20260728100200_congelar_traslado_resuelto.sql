begin;

-- el with check de traslados_trabajadores_update_admin_oficina solo valida estado, y
-- with check no puede mirar OLD: el admin que "aprueba" podia mandar en el mismo PATCH
-- otro trabajador_id / fecha / finca, y el trigger firmaba eso como resuelto por el.
-- la auditoria terminaba diciendo que el supervisor pidio algo que nunca pidio.
create or replace function public.resolver_traslado_trabajador()
returns trigger
language plpgsql
security invoker
as $$
begin
  if old.estado <> 'pendiente' then
    raise exception 'traslado ya resuelto: no se puede modificar';
  end if;

  -- resolver solo mueve el estado; el resto de la fila queda como la pidio el supervisor
  new.trabajador_id := old.trabajador_id;
  new.finca_origen_id := old.finca_origen_id;
  new.finca_destino_id := old.finca_destino_id;
  new.fecha := old.fecha;
  new.solicitado_por := old.solicitado_por;
  new.creado_en := old.creado_en;

  if new.estado <> 'pendiente' then
    new.resuelto_por := public.usuario_actual_id();
    new.resuelto_en := now();
  end if;

  return new;
end;
$$;

commit;
