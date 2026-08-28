# Spec — planilla

Feature **headless**, hospedada por `admin/screens/PlanillaScreen.tsx` en `/admin/planilla`. Es el único lugar donde se toca plata.

## Qué hace

Una tabla por quincena y por finca: cada trabajador con su salario, su bruto, su descuento por ausencias, su neto y si ya se le pagó. Botón de pagar y PDF de liquidación.

## Reglas

- **Quincena = medio mes calendario**: 1–15 y 16–fin de mes. 24 pagos al año.
- **El bruto es `salario_mensual / 2`**, ingresado a mano por el admin. No se deriva de horas ni de producción. Redondeo por moneda: colones al entero, USD a 2 decimales (`redondear-por-moneda.ts`, compartido con la deducción para que bruto − descuento siempre cierre).
- **Un día ausente cuesta `valor_hora × 8`.** Cuentan los tres tipos de ausencia. La finca tiene **dos** valores hora (`valor_hora` en colones, `valor_hora_usd`) y se usa el que coincide con la moneda del trabajador. **`0` significa "sin definir" y no descuenta nada** — descontar 1750 *dólares* por hora sería peor que no descontar. Neto topado en 0.
- **El pago es un snapshot.** `monto`, `moneda`, `monto_bruto` y `dias_ausentes` se congelan al pagar. Subir un salario, cambiar el valor hora o borrar una ausencia después **no reescribe** una quincena ya pagada, y la liquidación reimpresa sigue explicando el neto que imprimió. `monto_bruto` se guarda además de `dias_ausentes` porque el bruto no es reconstruible.
- **`pagos_quincenales` no tiene policy de UPDATE ni DELETE, a propósito.** Una quincena pagada se corrige con un ajuste nuevo, no editando el pasado.
- **El pago se hace en dos tandas**: asegurados y no asegurados (`filtrar-filas-por-seguro.ts`, selector arriba de la tabla). Arranca en `asegurados`.
- El salario y la moneda se editan **en la propia fila** (`CeldasSalario.tsx`) y el valor hora arriba de la tabla (`ValorHoraFinca.tsx`), invalidando `PLANILLA_QUERY_KEY` para que la quincena recalcule sin navegar.
- Cada control manda **solo su campo**: un PATCH completo pisaría con props desactualizadas lo que otro control acaba de escribir.
- Formatear siempre con la moneda de la fila (`formatear-monto.ts`). `toLocaleString('es-CR')` a secas pinta un salario en USD como si fueran colones.

## Qué NO hace

- **No hay pantalla `/admin/salarios`** y no debe volver: obliga a ir y volver para ver el efecto del número que acabás de escribir.
- No calcula aguinaldo, cesantía ni cargas sociales.
- La columna de monto semanal (mensual / 4) es **informativa**: no se paga ni se registra.
