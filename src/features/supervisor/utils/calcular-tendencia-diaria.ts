import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import type { TendenciaPunto } from '../types/dashboard.types'

export function calcularTendenciaDiaria(registros: readonly RegistroTrabajo[]): TendenciaPunto[] {
  const totalesPorDia = new Map<string, number>()

  for (const registro of registros) {
    const acumulado = totalesPorDia.get(registro.fecha) ?? 0
    totalesPorDia.set(registro.fecha, acumulado + (registro.cantidad ?? 0))
  }

  return Array.from(totalesPorDia.entries())
    .map(([fecha, valor]) => ({ fecha, valor }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
}
