import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { crearTrabajador } from '../services/trabajadores-service'
import type { TrabajadorFormValues } from '../types/trabajador-form.types'

const TRABAJADOR_INICIAL: TrabajadorFormValues = {
  nombreCompleto: '',
  fotoUrl: '',
  activo: true,
}

export function useAgregarTrabajador() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<TrabajadorFormValues>(TRABAJADOR_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof TrabajadorFormValues>(field: K, value: TrabajadorFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!values.nombreCompleto.trim()) {
      setError('Escribe el nombre del trabajador.')
      return
    }

    setIsSubmitting(true)

    try {
      await crearTrabajador({ ...values, fincaId: FINCA_ACTUAL.id })
      await queryClient.invalidateQueries({ queryKey: ['trabajadores', FINCA_ACTUAL.id] })
      setValues(TRABAJADOR_INICIAL)
      setSuccess('Trabajador agregado.')
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo agregar el trabajador.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, finca: FINCA_ACTUAL, error, success, isSubmitting, updateField, handleSubmit }
}
