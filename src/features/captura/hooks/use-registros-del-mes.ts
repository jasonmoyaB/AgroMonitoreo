import { useQuery } from '@tanstack/react-query'
import { listarRegistrosDelMes } from '../services/registros-service'
import { REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY } from '../constants/registros-query.constants'

export function useRegistrosDelMes(anioMes: string) {
  return useQuery({
    queryKey: [REGISTROS_QUERY_KEY, REGISTROS_MES_QUERY_KEY, anioMes],
    queryFn: () => listarRegistrosDelMes(anioMes),
  })
}
