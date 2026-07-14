import type { RegistroTrabajo, TipoLabor } from '../../types/domain.types'
import type { RankingItem } from '../../types/kpis.types'

export function calcularRankingLabores(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): RankingItem[] {
  const totalesPorLabor = new Map<string, number>()

  for (const registro of registros) {
    const acumulado = totalesPorLabor.get(registro.tipoLaborId) ?? 0
    totalesPorLabor.set(registro.tipoLaborId, acumulado + (registro.cantidad ?? 0))
  }

  return tiposLabor
    .flatMap((tipoLabor) => {
      const valor = totalesPorLabor.get(tipoLabor.id) ?? 0
      return valor > 0 ? [{ id: tipoLabor.id, etiqueta: tipoLabor.nombre, valor }] : []
    })
    .sort((a, b) => b.valor - a.valor)
}
