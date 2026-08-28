import { useQuery } from '@tanstack/react-query'
import { useRegistrosDelMes } from '../../captura/hooks/use-registros-del-mes'
import { listarTodosTrabajadoresSinDatosPorFinca } from '../../trabajadores/services/trabajadores-service'
import { TIPOS_LABOR } from '../../../shared/constants/tipos-labor.constants'
import { calcularKpisMensuales } from '../../../shared/utils/kpis/calcular-kpis-mensuales'
import { calcularHorasPorLabor } from '../../../shared/utils/kpis/calcular-horas-por-labor'
import { construirDashboardPorUnidad } from '../../../shared/utils/kpis/construir-dashboard-por-unidad'
import { useAniosDashboard } from './use-anios-dashboard'
import { useFincas } from './use-fincas'

export function useAdminRollupKpis(periodo: string) {
  const { fincas, isLoading: isLoadingFincas } = useFincas()
  const registrosQuery = useRegistrosDelMes(periodo)
  const trabajadoresQuery = useQuery({
    queryKey: ['trabajadores-admin', 'todas-fincas', fincas.map((finca) => finca.id)],
    queryFn: () => Promise.all(fincas.map((finca) => listarTodosTrabajadoresSinDatosPorFinca(finca.id))).then((listas) => listas.flat()),
    enabled: fincas.length > 0,
  })

  const aniosDisponibles = useAniosDashboard()
  const registrosDelMes = registrosQuery.data ?? []
  const trabajadores = trabajadoresQuery.data ?? []

  return {
    isLoading: isLoadingFincas || registrosQuery.isLoading || trabajadoresQuery.isLoading,
    aniosDisponibles,
    kpis: calcularKpisMensuales(registrosDelMes, trabajadores, TIPOS_LABOR),
    porUnidad: construirDashboardPorUnidad({ periodo, registros: registrosDelMes, trabajadores, tiposLabor: TIPOS_LABOR }),
    horasPorLabor: calcularHorasPorLabor(registrosDelMes, TIPOS_LABOR),
  }
}
