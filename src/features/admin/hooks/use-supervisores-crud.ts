import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useToastStore } from '../../../shared/stores/toast-store'
import { SUPERVISORES_QUERY_KEY } from '../constants/supervisores-query.constants'
import { actualizarSupervisor, cambiarEstadoSupervisor, listarSupervisores } from '../services/supervisores-service'
import type { SupervisorFormValues } from '../types/supervisor-crud.types'
import type { Supervisor } from '../types/supervisor.types'

const QUERY_KEY = [SUPERVISORES_QUERY_KEY]

export function useSupervisoresCrud() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [editando, setEditando] = useState<Supervisor | null>(null)
  const [values, setValues] = useState<SupervisorFormValues>({ nombre: '', rol: 'supervisor', fincaId: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: supervisores = [], isLoading } = useQuery({ queryKey: QUERY_KEY, queryFn: () => listarSupervisores() })

  function updateField<K extends keyof SupervisorFormValues>(field: K, value: SupervisorFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function abrirEditar(supervisor: Supervisor) {
    setEditando(supervisor)
    setValues({ nombre: supervisor.nombre ?? '', rol: supervisor.rol, fincaId: supervisor.fincaId })
    setError(null)
  }

  function cerrarForm() {
    setEditando(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editando) return
    if (!values.nombre.trim()) {
      setError('Escribe el nombre del supervisor.')
      return
    }

    setIsSubmitting(true)
    try {
      await actualizarSupervisor({ id: editando.id, ...values })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      cerrarForm()
      mostrarToast({ type: 'success', title: 'Supervisor actualizado', description: `${values.nombre.trim()} ya tiene los cambios aplicados.` })
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo guardar el supervisor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function alternarEstado(supervisor: Supervisor) {
    try {
      await cambiarEstadoSupervisor(supervisor)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      mostrarToast({ type: 'success', title: supervisor.activo ? 'Supervisor inactivado' : 'Supervisor activado' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo cambiar el estado.'
      mostrarToast({ type: 'error', title: 'No se pudo cambiar el estado', description })
    }
  }

  return {
    supervisores,
    values,
    error,
    isLoading,
    isSubmitting,
    isFormOpen: editando !== null,
    updateField,
    handleSubmit,
    onOpenEdit: abrirEditar,
    onCloseForm: cerrarForm,
    alternarEstado,
  }
}
