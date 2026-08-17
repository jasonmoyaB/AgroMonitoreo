import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { USUARIO_ACTUAL_QUERY_KEY } from './use-usuario-actual'

// El supervisor recien invitado queda esperando a que el admin le asigne la finca.
// refetchOnWindowFocus ya lo resuelve solo cuando vuelve a la app, pero si se queda
// mirando la pantalla no pasa nada nunca: esto le da como preguntar de nuevo sin tener
// que cerrar y reabrir la PWA, que para un capataz es una llamada de soporte.
export function useRecargarUsuario() {
  const queryClient = useQueryClient()
  const [isRecargando, setIsRecargando] = useState(false)

  async function recargar() {
    setIsRecargando(true)
    try {
      await queryClient.invalidateQueries({ queryKey: USUARIO_ACTUAL_QUERY_KEY })
    } finally {
      setIsRecargando(false)
    }
  }

  return { recargar, isRecargando }
}
