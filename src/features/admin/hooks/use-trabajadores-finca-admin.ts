import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../../shared/stores/toast-store'
import { TRABAJADORES_QUERY_KEY } from '../../trabajadores/constants/trabajadores-query.constants'
import { cambiarAseguradoTrabajador, listarTodosTrabajadoresPorFinca } from '../../trabajadores/services/trabajadores-service'
import { TRABAJADORES_ADMIN_QUERY_KEY } from '../constants/trabajadores-admin-query.constants'

export function useTrabajadoresFincaAdmin(fincaId: string | null) {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const { data: trabajadores = [], isLoading } = useQuery({
    queryKey: [TRABAJADORES_ADMIN_QUERY_KEY, fincaId],
    queryFn: () => listarTodosTrabajadoresPorFinca(fincaId as string),
    enabled: fincaId !== null,
  })

  const { mutate: cambiarAsegurado, isPending: isGuardandoAsegurado } = useMutation({
    mutationFn: (input: { id: string; asegurado: boolean }) => cambiarAseguradoTrabajador(input),
    onSuccess: async (trabajador) => {
      // las dos pantallas leen la misma tabla con keys distintas: se invalidan ambas
      await queryClient.invalidateQueries({ queryKey: [TRABAJADORES_ADMIN_QUERY_KEY] })
      await queryClient.invalidateQueries({ queryKey: [TRABAJADORES_QUERY_KEY] })
      mostrarToast({ type: 'success', title: trabajador.asegurado ? 'Trabajador asegurado' : 'Trabajador sin seguro' })
    },
    onError: (error: Error) => {
      mostrarToast({ type: 'error', title: 'No se pudo cambiar el seguro', description: error.message })
    },
  })

  return { trabajadores, isLoading, cambiarAsegurado, isGuardandoAsegurado }
}
