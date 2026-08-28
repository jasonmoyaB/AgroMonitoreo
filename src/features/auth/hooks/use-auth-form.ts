import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../../shared/stores/toast-store'
import { limpiarCacheQuery } from '../../../shared/lib/persistencia-query'
import { iniciarSesion } from '../services/auth-service'
import { obtenerUsuarioActual } from '../services/usuario-service'
import { useLoginCooldown } from './use-login-cooldown'

export function useAuthForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

      // Se tira lo que haya quedado del usuario anterior ANTES de navegar. El cierre de
      // sesion ya limpia, pero solo cuando tuvo exito: si al otro se le vencio el token o
      // simplemente cerro la pestaña, el blob de IndexedDB sobrevive y `useCachePersistente`
      // lo rehidrata en el arranque, sin saber todavia quien se va a loguear. Entre dos
      // organizaciones eso es pintarle a un cliente los trabajadores del otro.
      //
      // No cuesta nada offline: iniciar sesion ya exige red, asi que si se pudo llegar
      // hasta aca tambien se puede volver a leer lo que se descarta.
      await limpiarCacheQuery()
      queryClient.clear()

      navigate(await obtenerRutaSegunRol(), { replace: true })
      mostrarToast({ type: 'success', title: 'Has iniciado sesión' })
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
