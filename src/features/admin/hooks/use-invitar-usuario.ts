import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { SUPERVISORES_QUERY_KEY } from '../constants/supervisores-query.constants'
import { invitarUsuario } from '../services/supervisores-service'

export function useInvitarUsuario() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function abrir() {
    setEmail('')
    setError(null)
    setIsOpen(true)
  }

  function cerrar() {
    setIsOpen(false)
    setEmail('')
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Escribe el correo de la persona a invitar.')
      return
    }

    setIsSubmitting(true)
    try {
      await invitarUsuario(email)
      // inviteUserByEmail inserta en auth.users al invitar, y el trigger crea la fila
      // de `usuario` ahi mismo: el invitado ya aparece en la lista antes de aceptar.
      await queryClient.invalidateQueries({ queryKey: [SUPERVISORES_QUERY_KEY] })
      cerrar()
      mostrarToast({ type: 'success', title: 'Invitación enviada', description: `${email.trim()} recibirá un correo para entrar.` })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo enviar la invitación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isOpen, email, error, isSubmitting, setEmail, abrir, cerrar, handleSubmit }
}
