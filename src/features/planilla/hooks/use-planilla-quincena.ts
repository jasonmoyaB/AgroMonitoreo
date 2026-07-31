import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarSalariosPorFinca } from '../../admin/services/salarios-service'
import { useToastStore } from '../../../shared/stores/toast-store'
import { PLANILLA_QUERY_KEY } from '../constants/quincena.constants'
import { listarPagosQuincena, registrarPagoQuincena } from '../services/planilla-service'
import { construirFilasPlanilla } from '../utils/construir-filas-planilla'
import type { FilaPlanilla, NuevoPagoQuincenal, RangoQuincena } from '../types/planilla.types'

interface PlanillaQuincena {
  filas: FilaPlanilla[]
  isLoading: boolean
  pagar: (input: NuevoPagoQuincenal) => void
  isPagando: boolean
}

export function usePlanillaQuincena(fincaId: string | null, rango: RangoQuincena): PlanillaQuincena {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const queryKey = [PLANILLA_QUERY_KEY, fincaId, rango.inicio]

  const { data: filas = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const [salarios, pagos] = await Promise.all([listarSalariosPorFinca(fincaId as string), listarPagosQuincena(fincaId as string, rango.inicio)])
      return construirFilasPlanilla(salarios, pagos)
    },
    enabled: fincaId !== null,
  })

  const pago = useMutation({
    mutationFn: (input: NuevoPagoQuincenal) => registrarPagoQuincena(input),
    onSuccess: () => {
      mostrarToast({ type: 'success', title: 'Quincena pagada' })
      return queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo registrar el pago', description: error.message }),
  })

  return { filas, isLoading, pagar: pago.mutate, isPagando: pago.isPending }
}
