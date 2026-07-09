import type { RegistroTrabajo } from '../../../shared/types/domain.types'

export function obtenerIdsRegistradosPorLabor(registros: readonly RegistroTrabajo[], tipoLaborId: string): Set<string> {
  return new Set(registros.flatMap((registro) => (registro.tipoLaborId === tipoLaborId ? [registro.trabajadorId] : [])))
}
