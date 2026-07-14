import { useTodosRegistros } from '../../captura/hooks/use-todos-registros'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularMetricasPorLabor } from '../utils/calcular-metricas-por-labor'
import { calcularTotalesMetricas } from '../utils/calcular-totales-metricas'
import { filtrarRegistrosTrabajador } from '../utils/filtrar-registros-trabajador'
import { obtenerAniosDisponibles } from '../utils/obtener-anios-disponibles'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'

export function useTrabajadorMetricas(trabajadorId: string | null, filtros: TrabajadorMetricasFiltros) {
  const registrosQuery = useTodosRegistros()
  const registros = registrosQuery.data ?? []
  const registrosTrabajador = registros.filter((registro) => registro.trabajadorId === trabajadorId)
  const registrosFiltrados = trabajadorId ? filtrarRegistrosTrabajador(registros, trabajadorId, filtros) : []

  return {
    isLoading: registrosQuery.isLoading,
    metricasPorLabor: calcularMetricasPorLabor(registrosFiltrados, TIPOS_LABOR),
    totales: calcularTotalesMetricas(registrosFiltrados),
    aniosDisponibles: obtenerAniosDisponibles(registrosTrabajador),
  }
}
