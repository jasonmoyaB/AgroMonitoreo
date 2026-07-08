import { useQuery } from '@tanstack/react-query'
import { listarRegistrosPorFecha } from '../services/registros-service'

export function useRegistrosDelDia(fecha: string) {
  return useQuery({
    queryKey: ['registros', fecha],
    queryFn: () => listarRegistrosPorFecha(fecha),
  })
}
