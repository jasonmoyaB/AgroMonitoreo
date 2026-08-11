begin;

-- advisor 0011 (function_search_path_mutable): ambas se crearon sin search_path fijo,
-- asi que resuelven nombres con el search_path del caller. Un rol con create en algun
-- schema de esa lista puede sombrear lo que la funcion cree estar llamando.
--
-- Se usa '' (solo pg_catalog implicito) en vez de 'public' porque los dos cuerpos ya
-- califican todo: public.usuario / auth.uid() en una, public.usuario_actual_id() en la
-- otra. Con '' no queda ningun schema escribible en la ruta de resolucion.
--
-- alter function en vez de create or replace: no duplica el cuerpo y conserva el OID,
-- que importa porque usuario_actual_id() es el default de registros_trabajo.registrado_por.
alter function public.usuario_actual_id() set search_path = '';
alter function public.resolver_traslado_trabajador() set search_path = '';

commit;
