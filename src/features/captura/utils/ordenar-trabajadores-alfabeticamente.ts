import type { Trabajador } from '../../../shared/types/domain.types'

export function ordenarTrabajadoresAlfabeticamente<T extends Trabajador>(trabajadores: readonly T[]): T[] {
  return trabajadores.toSorted((primero, segundo) => primero.nombreCompleto.localeCompare(segundo.nombreCompleto, 'es'))
}
