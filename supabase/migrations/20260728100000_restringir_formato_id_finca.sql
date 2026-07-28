begin;

-- fincas.id se tipea a mano en el form de admin y se interpola en filtros PostgREST
-- (traslados-service) y en rutas del bucket trabajador-fotos. un id con comillas,
-- comas o parentesis rompe el filtro.
-- no se puede exigir slug (^[a-z0-9_-]+$): en produccion ya viven 'La Flor' y
-- 'Orosi - Purisil'. mayusculas y espacios son inofensivos ahi, asi que se permiten.
alter table public.fincas
  add constraint fincas_id_formato check (id ~ '^[A-Za-z0-9 _-]+$');

commit;
