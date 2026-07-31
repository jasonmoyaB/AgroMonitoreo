import { useRegistrosTrabajador } from '../../captura/hooks/use-registros-trabajador'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularMetricasPorLabor } from '../utils/calcular-metricas-por-labor'
import { calcularTotalesMetricas } from '../utils/calcular-totales-metricas'
import { filtrarRegistrosTrabajador } from '../utils/filtrar-registros-trabajador'
import { obtenerAniosDisponibles } from '../utils/obtener-anios-disponibles'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'

export function useTrabajadorMetricas(trabajadorId: string | null, filtros: TrabajadorMetricasFiltros) {
  const registrosQuery = useRegistrosTrabajador(trabajadorId)
  const registrosTrabajador = registrosQuery.data ?? []
  const registrosFiltrados = trabajadorId ? filtrarRegistrosTrabajador(registrosTrabajador, trabajadorId, filtros) : []

  return {
    isLoading: registrosQuery.isLoading,
    metricasPorLabor: calcularMetricasPorLabor(registrosFiltrados, TIPOS_LABOR),
    totales: calcularTotalesMetricas(registrosFiltrados),
    aniosDisponibles: obtenerAniosDisponibles(registrosTrabajador),
  }
}
