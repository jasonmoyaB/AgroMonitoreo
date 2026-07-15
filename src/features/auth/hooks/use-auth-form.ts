import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion, registrarSupervisor } from '../services/auth-service'
import { obtenerUsuarioActual } from '../services/usuario-service'
import { useLoginCooldown } from './use-login-cooldown'
import { validarPassword } from '../utils/validar-password'
import type { AuthMode } from '../types/auth.types'

export function useAuthForm(mode: AuthMode) {
  const navigate = useNavigate()
  const cooldown = useLoginCooldown()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (cooldown.segundosRestantes > 0) return

    if (mode === 'register') {
      const passwordError = validarPassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (mode === 'register') {
        const hasSession = await registrarNuevoSupervisor()
        if (!hasSession) return
        cooldown.resetear()
        navigate('/supervisor', { replace: true })
        return
      }

      await iniciarSesion({ email, password })
      cooldown.resetear()
      navigate(await obtenerRutaSegunRol(), { replace: true })
    } catch (unknownError) {
      cooldown.registrarIntentoFallido()
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

  return {
    email,
    password,
    error,
    notice,
    isSubmitting,
    segundosRestantes: cooldown.segundosRestantes,
    setEmail,
    setPassword,
    handleSubmit,
  }
}

async function obtenerRutaSegunRol(): Promise<string> {
  const usuario = await obtenerUsuarioActual()
  return usuario.rol === 'admin_oficina' ? '/admin' : '/supervisor'
}
