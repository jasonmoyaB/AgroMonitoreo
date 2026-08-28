import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularHorasPorLabor } from '../../../shared/utils/kpis/calcular-horas-por-labor'
import { construirDashboardPorUnidad } from '../../../shared/utils/kpis/construir-dashboard-por-unidad'
import { useAniosDashboard } from './use-anios-dashboard'
import { useTrabajadoresFincaAdmin } from './use-trabajadores-finca-admin'

export function useFincaDashboardKpis(fincaId: string | null, periodo: string) {
  const registrosQuery = useRegistrosDelMes(periodo, fincaId)
  const trabajadoresQuery = useTrabajadoresFincaAdmin(fincaId)
  const aniosDisponibles = useAniosDashboard()

  const registrosDelMes = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.trabajadores

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    aniosDisponibles,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    porUnidad: construirDashboardPorUnidad({ periodo, registros: registrosDelMes, trabajadores, tiposLabor: TIPOS_LABOR }),
    horasPorLabor: calcularHorasPorLabor(registrosDelMes, TIPOS_LABOR),
  }
}
