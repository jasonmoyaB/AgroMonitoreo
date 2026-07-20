export interface CantidadPorUnidad {
  unidad: string
  totalCantidad: number
  productividadPromedio: number
}

export interface DashboardKpis {
  totalHoras: number
  cantidadesPorUnidad: CantidadPorUnidad[]
  trabajadoresActivos: number
}

export interface RankingItem {
  id: string
  etiqueta: string
  valor: number
}

export interface TendenciaPunto {
  fecha: string
  valor: number
}
