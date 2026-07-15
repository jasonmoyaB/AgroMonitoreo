import type { RegistroTrabajo, Trabajador } from '../../types/domain.types'
import type { RankingItem } from '../../types/kpis.types'

const MAX_TRABAJADORES_RANKING = 5

export function calcularRankingTrabajadores(registros: readonly RegistroTrabajo[], trabajadores: readonly Trabajador[]): RankingItem[] {
  const totalesPorTrabajador = new Map<string, number>()

  for (const registro of registros) {
    const acumulado = totalesPorTrabajador.get(registro.trabajadorId) ?? 0
    totalesPorTrabajador.set(registro.trabajadorId, acumulado + (registro.cantidad ?? 0))
  }

  return trabajadores
    .flatMap((trabajador) => {
      const valor = totalesPorTrabajador.get(trabajador.id) ?? 0
      return valor > 0 ? [{ id: trabajador.id, etiqueta: trabajador.nombreCompleto, valor }] : []
    })
    .sort((a, b) => b.valor - a.valor)
    .slice(0, MAX_TRABAJADORES_RANKING)
}
