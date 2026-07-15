import { useQuery } from '@tanstack/react-query'
import { ASISTENCIA_DIA_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarAusentesPorFecha } from '../services/asistencia-service'

export function useAusentesDelDia(fincaId: string | undefined, fecha: string) {
  return useQuery({
    queryKey: [ASISTENCIA_DIA_QUERY_KEY, fecha, fincaId],
    queryFn: () => listarAusentesPorFecha(fincaId as string, fecha),
    enabled: !!fincaId,
  })
}
