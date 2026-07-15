import type { Trabajador } from '../../../shared/types/domain.types'

export interface TrabajadorMetricasFiltros {
  anio: number | null
  fechaInicio: string | null
  fechaFin: string | null
}

export interface MetricaPorLabor {
  tipoLaborId: string
  nombre: string
  horas: number
  horasExtra: number
  cantidad: number
  cantidadExtra: number
  productividad: number
  unidadMedida: string | null
}

export interface TrabajadorMetricasTotales {
  horas: number
  horasExtra: number
  cantidad: number
  productividad: number
}

export interface TrabajadorMetricasModalState {
  trabajador: Trabajador | null
  isOpen: boolean
  filtros: TrabajadorMetricasFiltros
  aniosDisponibles: number[]
  metricasPorLabor: MetricaPorLabor[]
  totales: TrabajadorMetricasTotales
  isLoading: boolean
}

export interface TrabajadorMetricasModalActions {
  onFiltroChange: <K extends keyof TrabajadorMetricasFiltros>(campo: K, valor: TrabajadorMetricasFiltros[K]) => void
  onResetFiltros: () => void
  onClose: () => void
}
