import { useQuery } from '@tanstack/react-query'
import { listarRegistrosPorFecha } from '../services/registros-service'
import { REGISTROS_QUERY_KEY } from '../constants/registros-query.constants'

export function useRegistrosDelDia(fecha: string) {
  return useQuery({
    queryKey: [REGISTROS_QUERY_KEY, fecha],
    queryFn: () => listarRegistrosPorFecha(fecha),
  })
}
