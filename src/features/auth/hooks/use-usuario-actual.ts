import { useQuery } from '@tanstack/react-query'
import { USUARIO_ACTUAL_QUERY_KEY } from '../constants/usuario-query.constants'
import { obtenerUsuarioActual } from '../services/usuario-service'

// refetch/isFetching salen tal cual de useQuery: el supervisor sin finca los usa para
// volver a preguntar cuando el admin ya se la asigno, sin cerrar y reabrir la PWA.
export function useUsuarioActual(enabled = true) {
  const { data: usuario, isLoading, isFetching, refetch } = useQuery({ queryKey: USUARIO_ACTUAL_QUERY_KEY, queryFn: () => obtenerUsuarioActual(), enabled })

  return { usuario, isLoading, isFetching, refetch }
}
