import type { Trabajador } from '../../../shared/types/domain.types'
import { FINCA_FILTRO_TODAS } from '../constants/trabajador-filtro.constants'
import type { EstadoFiltro, TrabajadoresFiltros } from '../types/trabajador-filtro.types'

export function filtrarTrabajadores(trabajadores: readonly Trabajador[], filtros: TrabajadoresFiltros): Trabajador[] {
  return trabajadores.filter(
    (trabajador) =>
      coincideNombre(trabajador.nombreCompleto, filtros.nombre) &&
      coincideEstado(trabajador.activo, filtros.estado) &&
      coincideFinca(trabajador.fincaId, filtros.fincaId),
  )
}

function coincideNombre(nombreCompleto: string, filtroNombre: string): boolean {
  return nombreCompleto.toLowerCase().includes(filtroNombre.trim().toLowerCase())
}

function coincideEstado(activo: boolean, filtroEstado: EstadoFiltro): boolean {
  if (filtroEstado === 'todos') return true
  return filtroEstado === 'activo' ? activo : !activo
}

function coincideFinca(fincaId: string, filtroFincaId: string): boolean {
  return filtroFincaId === FINCA_FILTRO_TODAS || fincaId === filtroFincaId
}
