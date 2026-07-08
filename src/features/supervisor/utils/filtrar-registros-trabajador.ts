import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { descomponerFechaIso } from '../../captura/utils/fecha-iso'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'

export function filtrarRegistrosTrabajador(
  registros: readonly RegistroTrabajo[],
  trabajadorId: string,
  filtros: TrabajadorMetricasFiltros,
): RegistroTrabajo[] {
  return registros.filter((registro) => {
    if (registro.trabajadorId !== trabajadorId) return false
    if (filtros.anio !== null && descomponerFechaIso(registro.fecha).anio !== filtros.anio) return false
    if (filtros.fechaInicio && registro.fecha < filtros.fechaInicio) return false
    if (filtros.fechaFin && registro.fecha > filtros.fechaFin) return false
    return true
  })
}
