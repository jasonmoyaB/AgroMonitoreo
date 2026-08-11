-- valor_hora quedo en colones (nacio como valor_hora_clp). el salario de cada trabajador
-- puede ser usd, y descontarle 1750 dolares por hora ausente seria absurdo: cada moneda
-- necesita su propio valor hora.
-- default 0 = "sin definir" -> el calculo no descuenta, en vez de descontar mal.
begin;

alter table public.fincas
  add column valor_hora_usd numeric(10, 2) not null default 0
    check (valor_hora_usd >= 0);

commit;
