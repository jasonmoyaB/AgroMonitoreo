import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../../../shared/utils/kpis/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../../../shared/utils/kpis/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../../../shared/utils/kpis/calcular-tendencia-diaria'
import { calcularHorasPorLabor } from '../../../shared/utils/kpis/calcular-horas-por-labor'
import { construirProduccionDiaria } from '../../../shared/utils/kpis/construir-produccion-diaria'
import { useAniosDashboard } from './use-anios-dashboard'
import { useTrabajadoresFincaAdmin } from './use-trabajadores-finca-admin'

export function useFincaDashboardKpis(fincaId: string | null, periodo: string) {
  const registrosQuery = useRegistrosDelMes(periodo)
  const trabajadoresQuery = useTrabajadoresFincaAdmin(fincaId)
  const aniosDisponibles = useAniosDashboard()

  const registrosDelMes = (registrosQuery.data ?? []).filter((registro) => registro.fincaId === fincaId)
  const trabajadores = trabajadoresQuery.trabajadores
  const tendenciaDiaria = calcularTendenciaDiaria(registrosDelMes)

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    aniosDisponibles,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria,
    produccionDiaria: construirProduccionDiaria(periodo, tendenciaDiaria),
    horasPorLabor: calcularHorasPorLabor(registrosDelMes, TIPOS_LABOR),
  }
}
