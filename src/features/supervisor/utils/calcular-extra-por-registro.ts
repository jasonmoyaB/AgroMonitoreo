import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { JORNADA_NORMAL_HORAS } from '../constants/trabajador-metricas.constants'

export interface ExtraPorRegistro {
  horasExtra: number
  cantidadExtra: number
}

export function calcularExtraPorRegistro(registros: readonly RegistroTrabajo[]): Map<string, ExtraPorRegistro> {
  const extraPorId = new Map<string, ExtraPorRegistro>()

  agruparPorFecha(registros).forEach((registrosDelDia) => {
    repartirExcesoDelDia(registrosDelDia, extraPorId)
  })

  return extraPorId
}

function agruparPorFecha(registros: readonly RegistroTrabajo[]): Map<string, RegistroTrabajo[]> {
  const grupos = new Map<string, RegistroTrabajo[]>()
  registros.forEach((registro) => grupos.set(registro.fecha, [...(grupos.get(registro.fecha) ?? []), registro]))
  return grupos
}

function repartirExcesoDelDia(registrosDelDia: readonly RegistroTrabajo[], extraPorId: Map<string, ExtraPorRegistro>): void {
  const ordenados = registrosDelDia.toSorted((a, b) => a.createdAt.localeCompare(b.createdAt))
  let acumuladoAntes = 0

  for (const registro of ordenados) {
    const acumuladoDespues = acumuladoAntes + registro.horas
    const horasDentroDeJornada = Math.max(0, Math.min(acumuladoDespues, JORNADA_NORMAL_HORAS) - acumuladoAntes)
    const horasExtra = registro.horas - horasDentroDeJornada

    if (horasExtra > 0) extraPorId.set(registro.id, { horasExtra, cantidadExtra: prorratearCantidad(registro, horasExtra) })
    acumuladoAntes = acumuladoDespues
  }
}

function prorratearCantidad(registro: RegistroTrabajo, horasExtra: number): number {
  if (registro.horas === 0) return 0
  return Math.round(((registro.cantidad ?? 0) * horasExtra) / registro.horas)
}
