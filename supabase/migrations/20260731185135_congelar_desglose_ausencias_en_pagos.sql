-- el pago ya congelaba monto y moneda; ahora congela tambien por que ese monto es ese.
-- sin monto_bruto el desglose no se puede reconstruir: si el admin cambia valor_hora
-- despues del pago, monto + dias * valor_hora * 8 deja de dar el bruto original y la
-- liquidacion reimpresa no cuadra con lo que se pago.
begin;

alter table public.pagos_quincenales
  add column dias_ausentes integer not null default 0
    check (dias_ausentes >= 0),
  add column monto_bruto numeric(10, 2) not null default 0
    check (monto_bruto >= 0);

commit;
