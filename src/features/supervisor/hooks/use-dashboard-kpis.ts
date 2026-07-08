import { useTodosRegistros } from '../../captura/hooks/use-todos-registros'
import { useTrabajadoresPorFinca } from '../../captura/hooks/use-trabajadores-por-finca'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../utils/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../utils/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../utils/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../utils/calcular-tendencia-diaria'
import { filtrarRegistrosDelMes } from '../utils/filtrar-registros-del-mes'

export function useDashboardKpis() {
  const registrosQuery = useTodosRegistros()
  const trabajadoresQuery = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const registros = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []
  const registrosDelMes = filtrarRegistrosDelMes(registros)

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria: calcularTendenciaDiaria(registrosDelMes),
  }
}
