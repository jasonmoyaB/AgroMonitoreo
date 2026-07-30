begin;

-- el `grant select, insert` de 20260729163414 no alcanza: el proyecto hosted otorga por
-- default todos los verbos (incluido delete y truncate) a anon y authenticated sobre cada
-- tabla nueva, y un grant aditivo no los quita. hoy solo RLS impide borrar un pago; esto
-- lo hace imposible tambien a nivel de permiso, para que agregar una policy distraida
-- manana no reabra el borrado de un registro financiero.
-- el mismo default aplica al resto de las tablas del proyecto: se acota solo esta porque
-- su invariante es ser insert-only.
revoke all on table public.pagos_quincenales from anon;
revoke update, delete, truncate, references, trigger on table public.pagos_quincenales from authenticated;

commit;
