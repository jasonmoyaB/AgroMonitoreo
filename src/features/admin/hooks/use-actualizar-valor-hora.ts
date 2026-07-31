import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarValorHoraFinca } from '../services/fincas-service'
import { FINCAS_QUERY_KEY } from '../constants/fincas-query.constants'
import { useToastStore } from '../../../shared/stores/toast-store'

export function useActualizarValorHora() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  return useMutation({
    mutationFn: (input: { id: string; valorHora: number }) => actualizarValorHoraFinca(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FINCAS_QUERY_KEY] }),
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo guardar el valor hora', description: error.message }),
  })
}
