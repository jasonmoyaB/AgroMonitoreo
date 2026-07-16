import { useState, type FormEvent } from 'react'
import { solicitarRecuperacionPassword } from '../services/auth-service'

const MENSAJE_EXITO = 'Si el correo existe, te llegó un mensaje con instrucciones para recuperar tu contraseña.'
const MENSAJE_ERROR_DEFAULT = 'No se pudo enviar el correo. Intenta nuevamente.'

export function useForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      await solicitarRecuperacionPassword({ email })
      setNotice(MENSAJE_EXITO)
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : MENSAJE_ERROR_DEFAULT)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, error, notice, isSubmitting, setEmail, handleSubmit }
}
