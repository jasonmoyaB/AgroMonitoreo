import { useQuery } from '@tanstack/react-query'
import { listarAusentesPorFecha } from '../services/asistencia-service'

export function useAusentesDelDia(fecha: string) {
  return useQuery({
    queryKey: ['asistencia', fecha],
    queryFn: () => listarAusentesPorFecha(fecha),
  })
}
