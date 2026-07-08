import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../services/auth-service'

export function useCerrarSesion() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleCerrarSesion() {
    setIsSigningOut(true)

    try {
      await cerrarSesion()
      navigate('/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  return { isSigningOut, handleCerrarSesion }
}
