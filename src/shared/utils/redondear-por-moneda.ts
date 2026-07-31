import type { Moneda } from '../types/domain.types'

const CENTIMOS_POR_UNIDAD = 100

// en colones nadie paga centimos, en usd si. lo usan el monto de la quincena y la
// deduccion por ausencias: si redondearan distinto, bruto - deduccion no cerraria.
export function redondearPorMoneda(monto: number, moneda: Moneda): number {
  if (moneda === 'colones') return Math.round(monto)
  return Math.round(monto * CENTIMOS_POR_UNIDAD) / CENTIMOS_POR_UNIDAD
}
