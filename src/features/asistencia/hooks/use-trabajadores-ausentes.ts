import { useQuery } from '@tanstack/react-query'
import { ASISTENCIA_TRABAJADORES_AUSENTES_QUERY_KEY } from '../constants/asistencia-query.constants'
import { listarIdsTrabajadoresAusentes } from '../services/asistencia-service'

export function useTrabajadoresAusentes(fincaId: string) {
  return useQuery({
    queryKey: [ASISTENCIA_TRABAJADORES_AUSENTES_QUERY_KEY, fincaId],
    queryFn: () => listarIdsTrabajadoresAusentes(fincaId),
  })
}
