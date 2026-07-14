import { useQuery } from '@tanstack/react-query'
import { listarTodosRegistros } from '../services/registros-service'
import { REGISTROS_QUERY_KEY, REGISTROS_TODOS_QUERY_KEY } from '../constants/registros-query.constants'

export function useTodosRegistros() {
  return useQuery({ queryKey: [REGISTROS_QUERY_KEY, REGISTROS_TODOS_QUERY_KEY], queryFn: () => listarTodosRegistros() })
}
