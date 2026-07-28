begin;

alter table public.fincas
  add column valor_hora_clp numeric(10, 2) not null default 1750
    check (valor_hora_clp >= 0);

commit;
