import { useQuery } from '@tanstack/react-query'
import { listarTodosTrabajadoresPorFinca } from '../../trabajadores/services/trabajadores-service'
import { TRABAJADORES_ADMIN_QUERY_KEY } from '../constants/trabajadores-admin-query.constants'

export function useTrabajadoresFincaAdmin(fincaId: string | null) {
  const { data: trabajadores = [], isLoading } = useQuery({
    queryKey: [TRABAJADORES_ADMIN_QUERY_KEY, fincaId],
    queryFn: () => listarTodosTrabajadoresPorFinca(fincaId as string),
    enabled: fincaId !== null,
  })

  return { trabajadores, isLoading }
}
