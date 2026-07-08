import type { Trabajador } from '../../../shared/types/domain.types'

export function filtrarTrabajadoresPorNombre(trabajadores: readonly Trabajador[], texto: string): Trabajador[] {
  const textoNormalizado = texto.trim().toLowerCase()
  if (!textoNormalizado) return [...trabajadores]
  return trabajadores.filter((trabajador) => trabajador.nombreCompleto.toLowerCase().includes(textoNormalizado))
}
