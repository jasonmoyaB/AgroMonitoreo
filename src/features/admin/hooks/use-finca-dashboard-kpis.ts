import { useTodosRegistros } from '../../captura/hooks/use-todos-registros'
import { obtenerAniosDashboard } from '../utils/obtener-anios-dashboard'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../../../shared/utils/kpis/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../../../shared/utils/kpis/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../../../shared/utils/kpis/calcular-tendencia-diaria'
import { filtrarRegistrosDelMes } from '../../../shared/utils/kpis/filtrar-registros-del-mes'
import { useTrabajadoresFincaAdmin } from './use-trabajadores-finca-admin'

export function useFincaDashboardKpis(fincaId: string | null, periodo?: string) {
  const registrosQuery = useTodosRegistros()
  const trabajadoresQuery = useTrabajadoresFincaAdmin(fincaId)

  const registrosFinca = (registrosQuery.data ?? []).filter((registro) => registro.fincaId === fincaId)
  const registrosDelMes = filtrarRegistrosDelMes(registrosFinca, periodo)
  const trabajadores = trabajadoresQuery.trabajadores

  return {
    isLoading: registrosQuery.isLoading || trabajadoresQuery.isLoading,
    aniosDisponibles: obtenerAniosDashboard(registrosFinca),
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria: calcularTendenciaDiaria(registrosDelMes),
  }
}
