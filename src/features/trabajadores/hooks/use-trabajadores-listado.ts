import { useQuery } from '@tanstack/react-query'
import { useUsuarioActual } from '../../auth/hooks/use-usuario-actual'
import { TRABAJADORES_QUERY_KEY } from '../constants/trabajadores-query.constants'
import { listarTodosTrabajadoresPorFinca } from '../services/trabajadores-service'

export function useTrabajadoresListado() {
  const { usuario } = useUsuarioActual()
  const fincaId = usuario?.fincaId
  const { data: trabajadores = [], isLoading } = useQuery({
    queryKey: [TRABAJADORES_QUERY_KEY, fincaId],
    queryFn: () => listarTodosTrabajadoresPorFinca(fincaId as string),
    enabled: !!fincaId,
  })

  return { trabajadores, isLoading, finca: { id: fincaId ?? '', nombre: usuario?.fincaNombre ?? '', activa: true } }
}
