-- Las fincas son de Costa Rica (colones), no de Chile: el sufijo _clp (peso chileno)
-- estaba mal. La moneda por trabajador ya vive en trabajadores.moneda ('usd' | 'colones'),
-- asi que la columna de finca queda sin sufijo de moneda.
begin;

alter table public.fincas
  rename column valor_hora_clp to valor_hora;

commit;
