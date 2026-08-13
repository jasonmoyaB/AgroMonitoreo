import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { invitarUsuario } from '../services/supervisores-service'

export function useInvitarUsuario() {
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
      cerrar()
      mostrarToast({ type: 'success', title: 'Invitación enviada', description: `${email.trim()} recibirá un correo para entrar.` })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo enviar la invitación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // La lista solo cambia cuando el invitado acepta y se crea su fila en `usuario`,
  // asi que no hay nada que invalidar todavia.
  return { isOpen, email, error, isSubmitting, setEmail, abrir, cerrar, handleSubmit }
}
