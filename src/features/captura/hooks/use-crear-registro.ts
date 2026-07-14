import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearRegistro } from '../services/registros-service'
import { playConfirmSound } from '../../../shared/lib/play-sound'
import { REGISTROS_QUERY_KEY } from '../constants/registros-query.constants'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'

const INTENTOS_REINTENTO = 3

export function useCrearRegistro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registro: RegistroTrabajo) => crearRegistro(registro),
    retry: INTENTOS_REINTENTO,
    onSuccess: () => {
      playConfirmSound()
      queryClient.invalidateQueries({ queryKey: [REGISTROS_QUERY_KEY] })
    },
  })
}
