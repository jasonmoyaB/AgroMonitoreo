export interface DashboardKpis {
  totalHoras: number
  totalCantidad: number
  productividadPromedio: number
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
