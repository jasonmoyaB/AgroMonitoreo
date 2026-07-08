import type { Trabajador } from '../../../shared/types/domain.types'

export function ordenarTrabajadoresAlfabeticamente(trabajadores: readonly Trabajador[]): Trabajador[] {
  return [...trabajadores].sort((primero, segundo) => primero.nombreCompleto.localeCompare(segundo.nombreCompleto, 'es'))
}
