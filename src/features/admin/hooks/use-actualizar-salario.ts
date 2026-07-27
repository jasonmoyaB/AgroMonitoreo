import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarSalarioTrabajador } from '../../trabajadores/services/trabajadores-service'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Trabajador } from '../../../shared/types/domain.types'

export function useActualizarSalario() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)

  return useMutation({
    mutationFn: (input: { id: string; salarioMensual: number; moneda: Trabajador['moneda'] }) => actualizarSalarioTrabajador(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trabajadores-admin'] }),
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo guardar el salario', description: error.message }),
  })
}
