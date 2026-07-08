import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion, registrarSupervisor } from '../services/auth-service'
import type { AuthMode } from '../types/auth.types'

const PASSWORD_MIN_LENGTH = 6

export function useAuthForm(mode: AuthMode) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'login') await iniciarSesion({ email, password })
      if (mode === 'register') {
        const hasSession = await registrarNuevoSupervisor()
        if (!hasSession) return
      }
      navigate('/supervisor', { replace: true })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo completar la acción.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function registrarNuevoSupervisor(): Promise<boolean> {
    const hasSession = await registrarSupervisor({ email, password })

    if (!hasSession) {
      setNotice('Cuenta creada. Revisa tu correo para confirmar el acceso antes de iniciar sesión.')
    }

    return hasSession
  }

  return { email, password, error, notice, isSubmitting, setEmail, setPassword, handleSubmit }
}
