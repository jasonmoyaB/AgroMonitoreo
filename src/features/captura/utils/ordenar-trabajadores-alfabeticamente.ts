import type { TrabajadorNombrable } from '../../../shared/types/domain.types'

export function ordenarTrabajadoresAlfabeticamente<T extends TrabajadorNombrable>(trabajadores: readonly T[]): T[] {
  return trabajadores.toSorted((primero, segundo) => primero.nombreCompleto.localeCompare(segundo.nombreCompleto, 'es'))
}
