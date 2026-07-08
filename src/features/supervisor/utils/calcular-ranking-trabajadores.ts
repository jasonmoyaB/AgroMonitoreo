import type { RegistroTrabajo, Trabajador } from '../../../shared/types/domain.types'
import type { RankingItem } from '../types/dashboard.types'

const MAX_TRABAJADORES_RANKING = 5

export function calcularRankingTrabajadores(registros: readonly RegistroTrabajo[], trabajadores: readonly Trabajador[]): RankingItem[] {
  const totalesPorTrabajador = new Map<string, number>()

  for (const registro of registros) {
    const acumulado = totalesPorTrabajador.get(registro.trabajadorId) ?? 0
    totalesPorTrabajador.set(registro.trabajadorId, acumulado + (registro.cantidad ?? 0))
  }

  return trabajadores
    .map((trabajador) => ({ id: trabajador.id, etiqueta: trabajador.nombreCompleto, valor: totalesPorTrabajador.get(trabajador.id) ?? 0 }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, MAX_TRABAJADORES_RANKING)
}
