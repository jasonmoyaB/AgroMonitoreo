import type { MetricaPorLabor } from '../types/trabajador-metricas.types'

export interface CantidadPorUnidad {
  unidadMedida: string
  cantidad: number
}

export function agruparCantidadPorUnidad(metricas: readonly MetricaPorLabor[]): CantidadPorUnidad[] {
  const cantidadPorUnidad = new Map<string, number>()

  for (const metrica of metricas) {
    if (!metrica.unidadMedida || metrica.cantidad === 0) continue
    cantidadPorUnidad.set(metrica.unidadMedida, (cantidadPorUnidad.get(metrica.unidadMedida) ?? 0) + metrica.cantidad)
  }

  return Array.from(cantidadPorUnidad, ([unidadMedida, cantidad]) => ({ unidadMedida, cantidad }))
}
