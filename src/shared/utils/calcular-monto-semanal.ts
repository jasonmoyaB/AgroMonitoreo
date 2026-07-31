import { redondearPorMoneda } from './redondear-por-moneda'
import type { Moneda } from '../types/domain.types'

const SEMANAS_POR_MES = 4

// informativo: cuanto representa por semana el salario mensual. no es un monto que se pague
// ni se registre, la planilla sigue pagando por quincena.
// mensual / 4 y no mensual * 12 / 52: decision del usuario, la columna tiene que cerrar contra
// lo que el admin ya ve en pantalla (semanal * 2 = quincena, semanal * 4 = mes). el costo es
// que la semana calendario real es de 4,33 por mes, asi que sumar 52 de estas da mas que el
// anual: no importa mientras el numero no se pague.
export function calcularMontoSemanal(salarioMensual: number, moneda: Moneda): number {
  return redondearPorMoneda(salarioMensual / SEMANAS_POR_MES, moneda)
}
