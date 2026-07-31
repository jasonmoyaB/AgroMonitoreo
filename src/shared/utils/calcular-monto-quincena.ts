import { redondearPorMoneda } from './redondear-por-moneda'
import type { Moneda } from '../types/domain.types'

const QUINCENAS_POR_MES = 2

// el bruto de la quincena es la mitad del salario mensual: nunca sale de horas ni de
// cantidad producida (regla de negocio confirmada, ver features/planilla).
// las ausencias se restan despues, en calcular-deduccion-ausencias.
export function calcularMontoQuincena(salarioMensual: number, moneda: Moneda): number {
  return redondearPorMoneda(salarioMensual / QUINCENAS_POR_MES, moneda)
}
