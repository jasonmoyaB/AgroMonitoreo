begin;

-- La regla "un registro nunca lleva fecha futura" vivia solo en el cliente
-- (captura/utils/ajustar-fecha-a-limites.ts). registros_trabajo.fecha no tenia ningun
-- check y la RLS solo valida finca_id, asi que un POST a /rest/v1/registros_trabajo con
-- fecha '2030-01-01' entraba: no es escalacion de privilegios — el supervisor ya puede
-- escribir en su finca — pero ensucia KPIs, tendencias y el rango de quincena con datos
-- que ningun flujo de la app pudo haber generado.

-- Trigger y no CHECK: current_date no es inmutable, y un check que la use hace fallar un
-- pg_restore con filas que eran validas el dia que se escribieron.
create function private.rechazar_fecha_futura_registro()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.fecha > current_date then
    raise exception 'registros_trabajo.fecha no puede ser futura: %', new.fecha;
  end if;
  return new;
end;
$$;

-- Un trigger no necesita EXECUTE del rol que dispara la sentencia (Postgres lo chequea al
-- create trigger), y private no lo expone PostgREST, pero se revoca igual por si el schema
-- hereda default privileges.
revoke execute on function private.rechazar_fecha_futura_registro() from anon, authenticated;

create trigger registros_trabajo_fecha_no_futura
  before insert or update on public.registros_trabajo
  for each row
  execute function private.rechazar_fecha_futura_registro();

commit;
