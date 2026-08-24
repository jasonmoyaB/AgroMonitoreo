import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { useTrabajadoresPorFinca } from '../../captura/hooks/use-trabajadores-por-finca'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularHorasPorLabor } from '../../../shared/utils/kpis/calcular-horas-por-labor'
import { construirDashboardPorUnidad } from '../../../shared/utils/kpis/construir-dashboard-por-unidad'
import { anioMesLocal } from '../../../shared/utils/fecha-local'
import { formatearPeriodoNombre } from '../../../shared/utils/formatear-periodo-nombre'

export function useDashboardKpis() {
  const periodo = anioMesLocal()
  const registrosQuery = useRegistrosDelMes(periodo)
  const trabajadoresQuery = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const registrosDelMes = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    periodoNombre: formatearPeriodoNombre(periodo),
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    porUnidad: construirDashboardPorUnidad({ periodo, registros: registrosDelMes, trabajadores, tiposLabor: TIPOS_LABOR }),
    horasPorLabor: calcularHorasPorLabor(registrosDelMes, TIPOS_LABOR),
  }
}
