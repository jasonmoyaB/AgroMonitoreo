import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '../../../shared/stores/toast-store'
import { iniciarSesion } from '../services/auth-service'
import { obtenerUsuarioActual } from '../services/usuario-service'
import { useLoginCooldown } from './use-login-cooldown'

export function useAuthForm() {
  const navigate = useNavigate()
  const cooldown = useLoginCooldown()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (cooldown.segundosRestantes > 0) return

    setIsSubmitting(true)

    try {
      await iniciarSesion({ email, password })
      cooldown.resetear()
      mostrarToast({ type: 'success', title: 'Has iniciado sesión' })
      navigate(await obtenerRutaSegunRol(), { replace: true })
    } catch (unknownError) {
      cooldown.registrarIntentoFallido()
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo completar la acción.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    password,
    error,
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
