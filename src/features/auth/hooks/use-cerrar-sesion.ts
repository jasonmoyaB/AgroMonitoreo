import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCapturaSessionStore } from '../../../shared/stores/captura-session-store'
import { cerrarSesion } from '../services/auth-service'

export function useCerrarSesion() {
  const navigate = useNavigate()
  const reiniciarCaptura = useCapturaSessionStore((state) => state.reiniciar)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleCerrarSesion() {
    setIsSigningOut(true)

    try {
      await cerrarSesion()
      reiniciarCaptura()
      navigate('/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return { isSigningOut, handleCerrarSesion }
}
