import { useQuery } from '@tanstack/react-query'
import type { Trabajador } from '../../../shared/types/domain.types'
import { listarTrabajadoresPrestadosHoy } from '../../traslados/services/traslados-service'
import { useTrabajadoresPorFinca } from './use-trabajadores-por-finca'

export function useTrabajadoresDisponibles(fincaId: string | undefined, fecha: string) {
  const propios = useTrabajadoresPorFinca(fincaId)
  const prestados = useQuery({
    queryKey: ['trabajadores-prestados', fincaId, fecha],
    queryFn: () => listarTrabajadoresPrestadosHoy(fincaId as string, fecha),
    enabled: !!fincaId,
  })

  const data: Trabajador[] = [...(propios.data ?? []), ...(prestados.data ?? [])]
  return { data, isLoading: propios.isLoading || prestados.isLoading }
}
