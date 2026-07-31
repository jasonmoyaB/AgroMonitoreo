import type { Moneda } from '../types/domain.types'

const QUINCENAS_POR_MES = 2
const CENTIMOS_POR_UNIDAD = 100

// el monto de la quincena es la mitad del salario mensual: nunca sale de horas ni de
// cantidad producida (regla de negocio confirmada, ver features/planilla).
// el redondeo depende de la moneda: en colones nadie paga centimos, en usd si.
export function calcularMontoQuincena(salarioMensual: number, moneda: Moneda): number {
  const mitad = salarioMensual / QUINCENAS_POR_MES
  if (moneda === 'colones') return Math.round(mitad)
  return Math.round(mitad * CENTIMOS_POR_UNIDAD) / CENTIMOS_POR_UNIDAD
}
