-- la empresa tiene trabajadores asegurados y no asegurados. flag operativo, como activo.
-- default false: los trabajadores que ya existen arrancan sin asegurar y se marcan a mano.
begin;

alter table public.trabajadores
  add column asegurado boolean not null default false;

commit;
