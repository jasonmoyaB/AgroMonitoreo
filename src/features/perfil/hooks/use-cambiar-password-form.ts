import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { actualizarPassword } from '../../auth/services/auth-service'
import { validarPassword } from '../../auth/utils/validar-password'

interface CambiarPasswordValues {
  password: string
  confirmacion: string
}

const VALUES_INICIAL: CambiarPasswordValues = { password: '', confirmacion: '' }

export function useCambiarPasswordForm() {
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [values, setValues] = useState(VALUES_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof CambiarPasswordValues>(field: K, value: CambiarPasswordValues[K]) {
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
      setValues(VALUES_INICIAL)
      mostrarToast({ type: 'success', title: 'Contraseña actualizada' })
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
