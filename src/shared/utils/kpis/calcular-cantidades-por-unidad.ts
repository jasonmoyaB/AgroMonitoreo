import type { RegistroTrabajo, TipoLabor } from '../../types/domain.types'
import type { CantidadPorUnidad } from '../../types/kpis.types'

export function calcularCantidadesPorUnidad(registros: readonly RegistroTrabajo[], tiposLabor: readonly TipoLabor[]): CantidadPorUnidad[] {
  const unidadPorLabor = new Map(tiposLabor.map((tipoLabor) => [tipoLabor.id, tipoLabor.unidadMedida]))
  const acumuladoPorUnidad = new Map<string, { cantidad: number; horas: number }>()

  for (const registro of registros) {
    const unidad = unidadPorLabor.get(registro.tipoLaborId)
    if (!unidad) continue

    const actual = acumuladoPorUnidad.get(unidad) ?? { cantidad: 0, horas: 0 }
    acumuladoPorUnidad.set(unidad, {
      cantidad: actual.cantidad + (registro.cantidad ?? 0),
      horas: actual.horas + registro.horas,
    })
  }

  return Array.from(acumuladoPorUnidad.entries()).map(([unidad, totales]) => ({
    unidad,
    totalCantidad: totales.cantidad,
    productividadPromedio: totales.horas > 0 ? totales.cantidad / totales.horas : 0,
  }))
}
