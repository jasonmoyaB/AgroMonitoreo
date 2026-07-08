import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { descomponerFechaIso } from '../../captura/utils/fecha-iso'

export function obtenerAniosDisponibles(registros: readonly RegistroTrabajo[]): number[] {
  const anios = new Set(registros.map((registro) => descomponerFechaIso(registro.fecha).anio))
  return Array.from(anios).sort((a, b) => b - a)
}
