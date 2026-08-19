import type { LaborIconName } from './domain.types'

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

export interface DiaProduccion {
  dia: number
  fecha: string
  valor: number
}

// El mes entero, no solo los dias con datos: un hueco visible es la senal de que alguien
// no cargo ese dia, y eso es justo lo que el dashboard tiene que responder sin trabajo.
export interface ProduccionDiaria {
  dias: DiaProduccion[]
  total: number
  maximo: number
  promedio: number
  diasConRegistro: number
  mejorDia: DiaProduccion | null
}

export interface HorasPorLabor {
  id: string
  nombre: string
  icono: LaborIconName
  color: string
  horas: number
  porcentaje: number
  rendimiento: number
  unidad: string
}
