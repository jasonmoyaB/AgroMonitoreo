import { useQuery } from '@tanstack/react-query'
import { listarTrabajadoresPorFinca } from '../services/trabajadores-service'

export function useTrabajadoresPorFinca(fincaId: string | undefined) {
  return useQuery({
    queryKey: ['trabajadores', fincaId],
    queryFn: () => listarTrabajadoresPorFinca(fincaId as string),
    enabled: !!fincaId,
  })
}
