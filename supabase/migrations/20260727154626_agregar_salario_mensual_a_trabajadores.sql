begin;

alter table public.trabajadores
  add column salario_mensual numeric(10, 2) not null default 0
    check (salario_mensual >= 0),
  add column moneda text not null default 'colones'
    check (moneda in ('usd', 'colones'));

commit;
