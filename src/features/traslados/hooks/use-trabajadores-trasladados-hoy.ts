import { useQuery } from '@tanstack/react-query'
import { TRABAJADORES_TRASLADADOS_HOY_QUERY_KEY } from '../constants/traslados-query.constants'
import { listarTrabajadoresTrasladadosHoy } from '../services/traslados-service'

export function useTrabajadoresTrasladadosHoy(fincaId: string | undefined, fecha: string) {
  return useQuery({
    queryKey: [TRABAJADORES_TRASLADADOS_HOY_QUERY_KEY, fecha, fincaId],
    queryFn: () => listarTrabajadoresTrasladadosHoy(fincaId as string, fecha),
    enabled: !!fincaId,
  })
}
