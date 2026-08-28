import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { limpiarCacheQuery } from '../../../shared/lib/persistencia-query'
import { cerrarSesion } from '../services/auth-service'

export function useCerrarSesion() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const reiniciarCaptura = useCapturaSessionStore((state) => state.reiniciar)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleCerrarSesion() {
    setIsSigningOut(true)

    try {
      await cerrarSesion()
      reiniciarCaptura()
      // El cache persistido guarda nombres y datos de trabajadores y el dispositivo de campo
      // se comparte. Una mutacion pendiente tampoco sobreviviria: sin sesion la RLS la rechaza.
      queryClient.clear()
      await limpiarCacheQuery()
      navigate('/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return { isSigningOut, handleCerrarSesion }
}
