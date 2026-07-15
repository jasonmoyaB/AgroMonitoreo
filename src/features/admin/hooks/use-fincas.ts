import { useQuery } from '@tanstack/react-query'
import { FINCAS_QUERY_KEY } from '../constants/fincas-query.constants'
import { listarFincas } from '../services/fincas-service'

export function useFincas() {
  const { data: fincas = [], isLoading } = useQuery({ queryKey: [FINCAS_QUERY_KEY], queryFn: () => listarFincas() })

  return { fincas, isLoading }
}
