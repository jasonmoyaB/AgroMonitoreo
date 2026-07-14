import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Finca } from '../../../shared/types/domain.types'
import { FINCAS_QUERY_KEY } from '../constants/fincas-query.constants'
import { cambiarEstadoFinca, crearFinca, listarFincas } from '../services/fincas-service'
import type { CrearFincaInput } from '../types/finca-form.types'

const FORM_INICIAL: CrearFincaInput = { id: '', nombre: '' }
const QUERY_KEY = [FINCAS_QUERY_KEY]

export function useFincasCrud() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [values, setValues] = useState<CrearFincaInput>(FORM_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: fincas = [], isLoading } = useQuery({ queryKey: QUERY_KEY, queryFn: () => listarFincas() })

  function updateField<K extends keyof CrearFincaInput>(field: K, value: CrearFincaInput[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function abrirCrear() {
    setValues(FORM_INICIAL)
    setError(null)
    setIsFormOpen(true)
  }

  function cerrarForm() {
    setIsFormOpen(false)
    setValues(FORM_INICIAL)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.id.trim() || !values.nombre.trim()) {
      setError('Escribe un identificador y un nombre para la finca.')
      return
    }

    setIsSubmitting(true)
    try {
      await crearFinca(values)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      cerrarForm()
      mostrarToast({ type: 'success', title: 'Finca agregada', description: `${values.nombre.trim()} ya está disponible.` })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo guardar la finca.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function alternarEstado(finca: Finca) {
    try {
      await cambiarEstadoFinca(finca)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      mostrarToast({ type: 'success', title: finca.activa ? 'Finca inactivada' : 'Finca activada' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo cambiar el estado.'
      mostrarToast({ type: 'error', title: 'No se pudo cambiar el estado', description })
    }
  }

  return {
    fincas,
    values,
    error,
    isLoading,
    isSubmitting,
    isFormOpen,
    updateField,
    handleSubmit,
    onOpenCreate: abrirCrear,
    onCloseForm: cerrarForm,
    alternarEstado,
  }
}
