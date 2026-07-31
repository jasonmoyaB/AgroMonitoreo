import { redondearPorMoneda } from '../../../shared/utils/redondear-por-moneda'
import { JORNADA_NORMAL_HORAS } from '../../trabajadores/constants/trabajador-metricas.constants'
import type { Moneda } from '../../../shared/types/domain.types'

interface CalcularDeduccionAusenciasInput {
  diasAusentes: number
  valorHora: number
  moneda: Moneda
}

// el dia ausente vale la jornada normal completa: valor_hora * 8. no entran horas extra,
// nadie hace extra un dia que no trabajo.
// valorHora <= 0 es "sin definir" (el caso tipico: la finca no cargo el valor hora en usd):
// no descontar nada es preferible a descontar mal.
export function calcularDeduccionAusencias({ diasAusentes, valorHora, moneda }: CalcularDeduccionAusenciasInput): number {
  if (diasAusentes <= 0 || valorHora <= 0) return 0
  return redondearPorMoneda(diasAusentes * valorHora * JORNADA_NORMAL_HORAS, moneda)
}
