import type { Trabajador } from '../../../shared/types/domain.types'

export function ordenarTrabajadoresAlfabeticamente(trabajadores: readonly Trabajador[]): Trabajador[] {
  return trabajadores.toSorted((primero, segundo) => primero.nombreCompleto.localeCompare(segundo.nombreCompleto, 'es'))
}
