import { useQuery } from '@tanstack/react-query'
import { listarTrabajadoresPrestadosHoy } from '../../traslados/services/traslados-service'
import type { TrabajadorDisponible } from '../types/trabajador-disponible.types'
import { useTrabajadoresPorFinca } from './use-trabajadores-por-finca'

export function useTrabajadoresDisponibles(fincaId: string | undefined, fecha: string) {
  const propios = useTrabajadoresPorFinca(fincaId)
  const prestados = useQuery({
    queryKey: ['trabajadores-prestados', fincaId, fecha],
    queryFn: () => listarTrabajadoresPrestadosHoy(fincaId as string, fecha),
    enabled: !!fincaId,
  })

  const data: TrabajadorDisponible[] = [
    ...(propios.data ?? []).map((trabajador) => ({ ...trabajador, fincaOrigenNombre: null })),
    ...(prestados.data ?? []),
  ]
  return { data, isLoading: propios.isLoading || prestados.isLoading }
}
