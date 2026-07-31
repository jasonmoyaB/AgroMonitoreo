import { useQuery } from '@tanstack/react-query'
import { TRASLADOS_QUERY_KEY } from '../constants/traslados-query.constants'
import { listarTrasladosResueltos } from '../services/traslados-service'

export function useHistorialTraslados() {
  const { data: historial = [], isLoading } = useQuery({
    queryKey: [TRASLADOS_QUERY_KEY, 'historial'],
    queryFn: () => listarTrasladosResueltos(),
  })

  return { historial, isLoading }
}
