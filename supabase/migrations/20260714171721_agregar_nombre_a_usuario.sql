begin;

alter table public.usuario
  add column nombre text;

commit;
