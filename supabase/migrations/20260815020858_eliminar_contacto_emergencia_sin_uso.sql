begin;

-- La columna nacio con 20260814173849 y nunca tuvo consumidor: no esta en
-- TrabajadorFormValues, ni en el form del supervisor, ni en TrabajadorDetalleModal,
-- ni en el tipo Trabajador. Lo unico que la nombraba era MAPA.md, prometiendo un
-- campo que no se puede editar en ninguna pantalla.
--
-- Se borra en migracion aparte y no editando la original, que ya esta aplicada en
-- remoto: tocar el archivo aplicado deja el repo describiendo un esquema que la base
-- no tiene, y `pnpm db:types` la seguiria regenerando.
--
-- Si algun dia se pide contacto de emergencia, vuelve con su campo en el form.
alter table public.datos_trabajadores
  drop column if exists contacto_emergencia;

commit;
