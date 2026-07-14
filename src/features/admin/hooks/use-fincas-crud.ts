import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Finca } from '../../../shared/types/domain.types'
import { FINCAS_QUERY_KEY } from '../constants/fincas-query.constants'
import { actualizarFinca, cambiarEstadoFinca, crearFinca, listarFincas } from '../services/fincas-service'
import type { CrearFincaInput } from '../types/finca-form.types'

const FORM_INICIAL: CrearFincaInput = { id: '', nombre: '' }
const QUERY_KEY = [FINCAS_QUERY_KEY]

export function useFincasCrud() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [editando, setEditando] = useState<Finca | null>(null)
  const [values, setValues] = useState<CrearFincaInput>(FORM_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: fincas = [], isLoading } = useQuery({ queryKey: QUERY_KEY, queryFn: () => listarFincas() })

  function updateField<K extends keyof CrearFincaInput>(field: K, value: CrearFincaInput[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function abrirCrear() {
    setEditando(null)
    setValues(FORM_INICIAL)
    setError(null)
    setIsFormOpen(true)
  }

  function abrirEditar(finca: Finca) {
    setEditando(finca)
    setValues({ id: finca.id, nombre: finca.nombre })
    setError(null)
    setIsFormOpen(true)
  }

  function cerrarForm() {
    setIsFormOpen(false)
    setEditando(null)
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
      if (editando) await actualizarFinca({ id: editando.id, nombre: values.nombre })
      else await crearFinca(values)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      const descripcion = `${values.nombre.trim()} ya está disponible.`
      const titulo = editando ? 'Finca actualizada' : 'Finca agregada'
      cerrarForm()
      mostrarToast({ type: 'success', title: titulo, description: descripcion })
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
    isEditing: editando !== null,
    updateField,
    handleSubmit,
    onOpenCreate: abrirCrear,
    onOpenEdit: abrirEditar,
    onCloseForm: cerrarForm,
    alternarEstado,
  }
}
