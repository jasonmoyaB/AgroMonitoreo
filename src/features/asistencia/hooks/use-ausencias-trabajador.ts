import { useQuery } from '@tanstack/react-query'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { ASISTENCIA_TRABAJADOR_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarAusenciasPorTrabajador } from '../services/asistencia-service'

export function useAusenciasTrabajador(trabajadorId: string | null) {
  return useQuery({
    queryKey: [ASISTENCIA_TRABAJADOR_QUERY_KEY, FINCA_ACTUAL.id, trabajadorId],
    queryFn: () => listarAusenciasPorTrabajador(FINCA_ACTUAL.id, trabajadorId ?? ''),
    enabled: trabajadorId !== null,
  })
}
