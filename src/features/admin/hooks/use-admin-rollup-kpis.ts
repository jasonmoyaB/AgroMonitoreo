import { useQuery } from '@tanstack/react-query'
import { useTodosRegistros } from '../../captura/hooks/use-todos-registros'
import { listarTodosTrabajadoresPorFinca } from '../../trabajadores/services/trabajadores-service'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularRankingLabores } from '../../../shared/utils/kpis/calcular-ranking-labores'
import { calcularRankingTrabajadores } from '../../../shared/utils/kpis/calcular-ranking-trabajadores'
import { calcularTendenciaDiaria } from '../../../shared/utils/kpis/calcular-tendencia-diaria'
import { filtrarRegistrosDelMes } from '../../../shared/utils/kpis/filtrar-registros-del-mes'
import { useFincas } from './use-fincas'

export function useAdminRollupKpis() {
  const { fincas, isLoading: isLoadingFincas } = useFincas()
  const registrosQuery = useTodosRegistros()
  const trabajadoresQuery = useQuery({
    queryKey: ['trabajadores-admin', 'todas-fincas', fincas.map((finca) => finca.id)],
    queryFn: () => Promise.all(fincas.map((finca) => listarTodosTrabajadoresPorFinca(finca.id))).then((listas) => listas.flat()),
    enabled: fincas.length > 0,
  })

  const registros = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []
  const registrosDelMes = filtrarRegistrosDelMes(registros)

  return {
    isLoading: isLoadingFincas || registrosQuery.isLoading || trabajadoresQuery.isLoading,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    rankingLabores: calcularRankingLabores(registrosDelMes, TIPOS_LABOR),
    rankingTrabajadores: calcularRankingTrabajadores(registrosDelMes, trabajadores),
    tendenciaDiaria: calcularTendenciaDiaria(registrosDelMes),
  }
}
