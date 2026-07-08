import type { RegistroTrabajo, TipoLabor } from '../../../shared/types/domain.types'
import type { RankingItem } from '../types/dashboard.types'

export function calcularRankingLabores(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): RankingItem[] {
  const totalesPorLabor = new Map<string, number>()

  for (const registro of registros) {
    const acumulado = totalesPorLabor.get(registro.tipoLaborId) ?? 0
    totalesPorLabor.set(registro.tipoLaborId, acumulado + (registro.cantidad ?? 0))
  }

  return tiposLabor
    .map((tipoLabor) => ({ id: tipoLabor.id, etiqueta: tipoLabor.nombre, valor: totalesPorLabor.get(tipoLabor.id) ?? 0 }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)
}
