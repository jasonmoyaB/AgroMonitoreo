import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { useTrabajadoresPorFinca } from '../../captura/hooks/use-trabajadores-por-finca'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../../../shared/utils/kpis/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../../../shared/utils/kpis/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../../../shared/utils/kpis/calcular-tendencia-diaria'
import { calcularHorasPorLabor } from '../../../shared/utils/kpis/calcular-horas-por-labor'
import { construirProduccionDiaria } from '../../../shared/utils/kpis/construir-produccion-diaria'
import { anioMesLocal } from '../../../shared/utils/fecha-local'

export function useDashboardKpis() {
  const periodo = anioMesLocal()
  const registrosQuery = useRegistrosDelMes(periodo)
  const trabajadoresQuery = useTrabajadoresPorFinca(FINCA_ACTUAL.id)
  const registrosDelMes = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []
  const tendenciaDiaria = calcularTendenciaDiaria(registrosDelMes)

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria,
    produccionDiaria: construirProduccionDiaria(periodo, tendenciaDiaria),
    horasPorLabor: calcularHorasPorLabor(registrosDelMes, TIPOS_LABOR),
  }
}
