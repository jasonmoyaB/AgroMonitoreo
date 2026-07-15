import type { RegistroTrabajo, Trabajador } from '../../types/domain.types'
import type { DashboardKpis } from '../../types/kpis.types'

export function calcularKpisMensuales(registros: readonly RegistroTrabajo[], trabajadores: readonly Trabajador[]): DashboardKpis {
  const totalHoras = registros.reduce((suma, registro) => suma + registro.horas, 0)
  const totalCantidad = registros.reduce((suma, registro) => suma + (registro.cantidad ?? 0), 0)
  const productividadPromedio = totalHoras > 0 ? totalCantidad / totalHoras : 0

  return {
    totalHoras,
    totalCantidad,
    productividadPromedio,
    trabajadoresActivos: trabajadores.length,
  }
}
