import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioActual } from '../services/usuario-service'

const USUARIO_ACTUAL_QUERY_KEY = ['usuario', 'actual']

export function useUsuarioActual(enabled = true) {
  const { data: usuario, isLoading } = useQuery({ queryKey: USUARIO_ACTUAL_QUERY_KEY, queryFn: () => obtenerUsuarioActual(), enabled })

  return { usuario, isLoading }
}
