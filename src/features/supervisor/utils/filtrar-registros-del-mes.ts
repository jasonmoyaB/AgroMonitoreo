import type { RegistroTrabajo } from '../../../shared/types/domain.types'

function obtenerMesActual(): string {
  return new Date().toISOString().slice(0, 7)
}

export function filtrarRegistrosDelMes(registros: readonly RegistroTrabajo[], mes: string = obtenerMesActual()): RegistroTrabajo[] {
  return registros.filter((registro) => registro.fecha.startsWith(mes))
}
