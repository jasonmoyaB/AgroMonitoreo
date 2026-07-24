import type { Trabajador } from '../../../shared/types/domain.types'

export function filtrarTrabajadoresPorNombre<T extends Trabajador>(trabajadores: readonly T[], texto: string): T[] {
  const textoNormalizado = texto.trim().toLowerCase()
  if (!textoNormalizado) return [...trabajadores]
  return trabajadores.filter((trabajador) => trabajador.nombreCompleto.toLowerCase().includes(textoNormalizado))
}
