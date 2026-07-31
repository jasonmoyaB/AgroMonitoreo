begin;

alter table public.trabajadores
  drop column salario_hora_clp;

commit;
