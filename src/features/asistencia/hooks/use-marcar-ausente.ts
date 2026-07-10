import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ASISTENCIA_DIA_QUERY_KEY } from '../constants/asistencia-query.constants'
import { marcarAusente, quitarAusente } from '../services/asistencia-service'

interface ToggleAusenteInput {
  fincaId: string
  trabajadorId: string
  fecha: string
  estaAusente: boolean
}

export function useMarcarAusente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fincaId, trabajadorId, fecha, estaAusente }: ToggleAusenteInput) =>
      estaAusente ? quitarAusente(trabajadorId, fecha) : marcarAusente(fincaId, trabajadorId, fecha),
    onSuccess: (_data, { fecha }) => {
      queryClient.invalidateQueries({ queryKey: [ASISTENCIA_DIA_QUERY_KEY, fecha] })
    },
  })
}
