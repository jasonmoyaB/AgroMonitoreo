import { useQuery } from '@tanstack/react-query'
import { listarRegistrosPorFecha } from '../services/registros-service'
import { claveRegistrosDelDia } from '../constants/registros-query.constants'

export function useRegistrosDelDia(fecha: string) {
  return useQuery({
    queryKey: claveRegistrosDelDia(fecha),
    queryFn: () => listarRegistrosPorFecha(fecha),
  })
}
