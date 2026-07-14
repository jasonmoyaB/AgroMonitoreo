import { useQuery } from '@tanstack/react-query'
import { ASISTENCIA_TRABAJADOR_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarAusenciasPorTrabajador } from '../services/asistencia-service'

export function useAusenciasTrabajador(fincaId: string | undefined, trabajadorId: string | null) {
  return useQuery({
    queryKey: [ASISTENCIA_TRABAJADOR_QUERY_KEY, fincaId, trabajadorId],
    queryFn: () => listarAusenciasPorTrabajador(fincaId as string, trabajadorId ?? ''),
    enabled: !!fincaId && trabajadorId !== null,
  })
}
