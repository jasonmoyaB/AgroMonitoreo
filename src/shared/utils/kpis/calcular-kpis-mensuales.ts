import type { RegistroTrabajo, Trabajador, TipoLabor } from '../../types/domain.types'
import type { DashboardKpis } from '../../types/kpis.types'
import { calcularCantidadesPorUnidad } from './calcular-cantidades-por-unidad'

export function calcularKpisMensuales(
  registros: readonly RegistroTrabajo[],
  trabajadores: readonly Trabajador[],
  tiposLabor: readonly TipoLabor[]
): DashboardKpis {
  const totalHoras = registros.reduce((suma, registro) => suma + registro.horas, 0)

  return {
    totalHoras,
    cantidadesPorUnidad: calcularCantidadesPorUnidad(registros, tiposLabor),
    trabajadoresActivos: trabajadores.length,
  }
}
