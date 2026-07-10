import type { Trabajador } from '../../../shared/types/domain.types'
import type { EstadoFiltro, TrabajadoresFiltros } from '../types/trabajador-filtro.types'

export function filtrarTrabajadores(trabajadores: readonly Trabajador[], filtros: TrabajadoresFiltros, idsAusentes: ReadonlySet<string> = new Set<string>()): Trabajador[] {
  return trabajadores.filter(
    (trabajador) => coincideNombre(trabajador.nombreCompleto, filtros.nombre) && coincideEstado(trabajador, filtros.estado, idsAusentes),
  )
}

function coincideNombre(nombreCompleto: string, filtroNombre: string): boolean {
  return nombreCompleto.toLowerCase().includes(filtroNombre.trim().toLowerCase())
}

function coincideEstado(trabajador: Trabajador, filtroEstado: EstadoFiltro, idsAusentes: ReadonlySet<string>): boolean {
  if (filtroEstado === 'todos') return true
  if (filtroEstado === 'ausente') return idsAusentes.has(trabajador.id)
  return filtroEstado === 'activo' ? trabajador.activo : !trabajador.activo
}
