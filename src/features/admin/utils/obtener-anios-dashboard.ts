import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { obtenerAniosDisponibles } from '../../trabajadores/utils/obtener-anios-disponibles'
import { descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'

// el anio en curso siempre esta, aunque todavia no haya registros: sin el el selector
// de anio quedaria vacio y no se podria elegir nada. Al cambiar de anio entra solo.
export function obtenerAniosDashboard(registros: readonly RegistroTrabajo[]): number[] {
  const anioActual = descomponerFechaIso(fechaLocalIso()).anio
  return Array.from(new Set([anioActual, ...obtenerAniosDisponibles(registros)])).sort((a, b) => b - a)
}
