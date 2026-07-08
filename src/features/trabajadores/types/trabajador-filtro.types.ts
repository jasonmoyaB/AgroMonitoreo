export type EstadoFiltro = 'todos' | 'activo' | 'inactivo'

export interface TrabajadoresFiltros {
  nombre: string
  estado: EstadoFiltro
  fincaId: string
}
