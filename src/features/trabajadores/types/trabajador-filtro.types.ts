export type EstadoFiltro = 'todos' | 'activo' | 'inactivo' | 'ausente'

export interface TrabajadoresFiltros {
  nombre: string
  estado: EstadoFiltro
}
