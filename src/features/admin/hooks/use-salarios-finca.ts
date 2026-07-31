import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Moneda } from '../../../shared/types/domain.types'
import { SALARIOS_QUERY_KEY } from '../constants/salarios-query.constants'
import { guardarSalario, listarSalariosPorFinca } from '../services/salarios-service'

export function useSalariosFinca(fincaId: string | null) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const queryKey = [SALARIOS_QUERY_KEY, fincaId]

  const { data: salarios = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listarSalariosPorFinca(fincaId as string),
    enabled: fincaId !== null,
  })

  const guardar = useMutation({
    mutationFn: (input: { trabajadorId: string; salarioMensual?: number; moneda?: Moneda }) => guardarSalario(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo guardar el salario', description: error.message }),
  })

  return { salarios, isLoading, guardar: guardar.mutate }
}
