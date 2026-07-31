import { useQuery } from '@tanstack/react-query'
import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { listarTodosTrabajadoresPorFinca } from '../../trabajadores/services/trabajadores-service'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../../../shared/utils/kpis/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../../../shared/utils/kpis/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../../../shared/utils/kpis/calcular-tendencia-diaria'
import { useAniosDashboard } from './use-anios-dashboard'
import { useFincas } from './use-fincas'

export function useAdminRollupKpis(periodo: string) {
  const { fincas, isLoading: isLoadingFincas } = useFincas()
  const registrosQuery = useRegistrosDelMes(periodo)
  const trabajadoresQuery = useQuery({
    queryKey: ['trabajadores-admin', 'todas-fincas', fincas.map((finca) => finca.id)],
    queryFn: () => Promise.all(fincas.map((finca) => listarTodosTrabajadoresPorFinca(finca.id))).then((listas) => listas.flat()),
    enabled: fincas.length > 0,
  })

  const aniosDisponibles = useAniosDashboard()
  const registrosDelMes = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []

  return {
    isLoading: isLoadingFincas || registrosQuery.isLoading || trabajadoresQuery.isLoading,
    aniosDisponibles,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria: calcularTendenciaDiaria(registrosDelMes),
  }
}
