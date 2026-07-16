import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { actualizarPassword, cerrarSesion } from '../services/auth-service'
import { validarPassword } from '../utils/validar-password'

interface ResetPasswordValues {
  password: string
  confirmacion: string
}

const VALUES_INICIAL: ResetPasswordValues = { password: '', confirmacion: '' }

export function useResetPasswordForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState(VALUES_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ResetPasswordValues>(field: K, value: ResetPasswordValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validarNuevaPassword()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await actualizarPassword(values.password)
      await cerrarSesion()
      navigate('/login', { replace: true })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function validarNuevaPassword(): string | null {
    const passwordError = validarPassword(values.password)
    if (passwordError) return passwordError
    if (values.password !== values.confirmacion) return 'Las contraseñas no coinciden.'
    return null
  }

  return { values, error, isSubmitting, updateField, handleSubmit }
}
