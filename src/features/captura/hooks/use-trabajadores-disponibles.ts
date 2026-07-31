import { useQuery } from '@tanstack/react-query'
import { listarTrabajadoresPrestadosHoy } from '../../traslados/services/traslados-service'
import { TRABAJADORES_PRESTADOS_QUERY_KEY } from '../../traslados/constants/traslados-query.constants'
import type { TrabajadorDisponible } from '../types/trabajador-disponible.types'
import { useTrabajadoresPorFinca } from './use-trabajadores-por-finca'

export function useTrabajadoresDisponibles(fincaId: string | undefined, fecha: string) {
  const propios = useTrabajadoresPorFinca(fincaId)
  const prestados = useQuery({
    queryKey: [TRABAJADORES_PRESTADOS_QUERY_KEY, fincaId, fecha],
    queryFn: () => listarTrabajadoresPrestadosHoy(fincaId as string, fecha),
    enabled: !!fincaId,
  })

  const data: TrabajadorDisponible[] = [
    ...(propios.data ?? []).map((trabajador) => ({ ...trabajador, fincaOrigenNombre: null })),
    ...(prestados.data ?? []),
  ]
  return { data, isLoading: propios.isLoading || prestados.isLoading }
}
