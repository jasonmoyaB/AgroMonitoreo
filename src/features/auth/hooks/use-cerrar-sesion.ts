import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { useToastStore } from '../../../shared/stores/toast-store'
import { limpiarCacheQuery } from '../../../shared/lib/persistencia-query'
import { cerrarSesion } from '../services/auth-service'

export function useCerrarSesion() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const reiniciarCaptura = useCapturaSessionStore((state) => state.reiniciar)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Sin red `signOut` falla y GoTrue no borra la sesion local, asi que el usuario sigue
  // adentro: no se puede navegar a /login (RouteGuard lo devuelve) ni tiene sentido vaciar el
  // cache, porque con el token vivo la app lo vuelve a llenar en el proximo render. Lo unico
  // que no se puede hacer es lo que hacia antes — fallar callado y dejar la pantalla quieta.
  async function handleCerrarSesion() {
    setIsSigningOut(true)

    try {
      await cerrarSesion()
      reiniciarCaptura()
      // El cache persistido guarda nombres de trabajadores y el dispositivo de campo se
      // comparte; ademas sobrevive al vencimiento del token, asi que se borra al salir.
      queryClient.clear()
      await limpiarCacheQuery()
      navigate('/login', { replace: true })
    } catch {
      mostrarToast({ type: 'error', title: 'No se pudo cerrar sesión', description: 'Necesitás conexión. Intentá de nuevo al reconectar.' })
    } finally {
      setIsSigningOut(false)
    }
  }

  return { isSigningOut, handleCerrarSesion }
}
