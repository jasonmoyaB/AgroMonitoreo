import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearRegistro } from '../services/registros-service'
import { playConfirmSound } from '../../../shared/lib/play-sound'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'

const INTENTOS_REINTENTO = 3

export function useCrearRegistro() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (registro: RegistroTrabajo) => crearRegistro(registro),
    retry: INTENTOS_REINTENTO,
    onSuccess: (registro: RegistroTrabajo) => {
      playConfirmSound()
      queryClient.invalidateQueries({ queryKey: ['registros', registro.fecha] })
    },
  })
}
