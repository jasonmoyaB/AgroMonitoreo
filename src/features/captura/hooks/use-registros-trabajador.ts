import { useQuery } from '@tanstack/react-query'
import { listarRegistrosPorTrabajador } from '../services/registros-service'
import { REGISTROS_QUERY_KEY, REGISTROS_TRABAJADOR_QUERY_KEY } from '../constants/registros-query.constants'

export function useRegistrosTrabajador(trabajadorId: string | null) {
  return useQuery({
    queryKey: [REGISTROS_QUERY_KEY, REGISTROS_TRABAJADOR_QUERY_KEY, trabajadorId],
    queryFn: () => listarRegistrosPorTrabajador(trabajadorId ?? ''),
    enabled: trabajadorId !== null,
  })
}
