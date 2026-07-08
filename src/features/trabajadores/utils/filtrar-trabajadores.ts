import type { Trabajador } from '../../../shared/types/domain.types'
import type { EstadoFiltro, TrabajadoresFiltros } from '../types/trabajador-filtro.types'

export function filtrarTrabajadores(trabajadores: readonly Trabajador[], filtros: TrabajadoresFiltros): Trabajador[] {
  return trabajadores.filter(
    (trabajador) => coincideNombre(trabajador.nombreCompleto, filtros.nombre) && coincideEstado(trabajador.activo, filtros.estado),
  )
}

function coincideNombre(nombreCompleto: string, filtroNombre: string): boolean {
  return nombreCompleto.toLowerCase().includes(filtroNombre.trim().toLowerCase())
}

function coincideEstado(activo: boolean, filtroEstado: EstadoFiltro): boolean {
  if (filtroEstado === 'todos') return true
  return filtroEstado === 'activo' ? activo : !activo
}
