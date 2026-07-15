import { useQuery } from '@tanstack/react-query'
import { listarTodosTrabajadoresPorFinca } from '../../trabajadores/services/trabajadores-service'

export function useTrabajadoresFincaAdmin(fincaId: string | null) {
  const { data: trabajadores = [], isLoading } = useQuery({
    queryKey: ['trabajadores-admin', fincaId],
    queryFn: () => listarTodosTrabajadoresPorFinca(fincaId as string),
    enabled: fincaId !== null,
  })

  return { trabajadores, isLoading }
}
