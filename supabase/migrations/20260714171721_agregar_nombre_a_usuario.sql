begin;

alter table public.usuario
  add column nombre text;

grant select, insert, update, delete on table public.usuario to authenticated;

commit;
