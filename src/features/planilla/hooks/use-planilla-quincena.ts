import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { guardarSalario, listarSalariosPorFinca } from '../../admin/services/salarios-service'
import { listarAsistenciaPorRango } from '../../asistencia/services/asistencia-service'
import { useToastStore } from '../../../shared/stores/toast-store'
import { PLANILLA_QUERY_KEY } from '../constants/quincena.constants'
import { listarPagosQuincena, registrarPagoQuincena } from '../services/planilla-service'
import { construirFilasPlanilla } from '../utils/construir-filas-planilla'
import type { Finca } from '../../../shared/types/domain.types'
import type { EdicionSalario, FilaPlanilla, NuevoPagoQuincenal, RangoQuincena } from '../types/planilla.types'

interface PlanillaQuincena {
  filas: FilaPlanilla[]
  isLoading: boolean
  pagar: (input: NuevoPagoQuincenal) => void
  isPagando: boolean
  guardarSalario: (input: EdicionSalario) => void
}

const SIN_DATOS = { salarios: [], pagos: [], ausencias: [] }

export function usePlanillaQuincena(finca: Finca | null, rango: RangoQuincena): PlanillaQuincena {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const fincaId = finca?.id ?? null
  const queryKey = [PLANILLA_QUERY_KEY, fincaId, rango.inicio]

  const { data = SIN_DATOS, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const [salarios, pagos, ausencias] = await Promise.all([
        listarSalariosPorFinca(fincaId as string),
        listarPagosQuincena(fincaId as string, rango.inicio),
        listarAsistenciaPorRango(fincaId as string, rango.inicio, rango.fin),
      ])
      return { salarios, pagos, ausencias }
    },
    enabled: fincaId !== null,
  })

  // las filas se arman fuera de queryFn a proposito: el valor hora vive en la query de
  // fincas, y cambiarlo debe reflejarse sin refetch ni meterlo en la queryKey
  const filas = finca === null ? [] : construirFilasPlanilla({ ...data, finca })

  const pago = useMutation({
    mutationFn: (input: NuevoPagoQuincenal) => registrarPagoQuincena(input),
    onSuccess: () => {
      mostrarToast({ type: 'success', title: 'Quincena pagada' })
      return queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo registrar el pago', description: error.message }),
  })

  // el salario se edita en la misma tabla, asi que invalida la query de la planilla y no
  // una propia: la fila recalcula la quincena sin salir de la pantalla
  const salario = useMutation({
    mutationFn: (input: EdicionSalario) => guardarSalario(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => mostrarToast({ type: 'error', title: 'No se pudo guardar el salario', description: error.message }),
  })

  return { filas, isLoading, pagar: pago.mutate, isPagando: pago.isPending, guardarSalario: salario.mutate }
}
