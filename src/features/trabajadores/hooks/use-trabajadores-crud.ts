import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Trabajador } from '../../../shared/types/domain.types'
import { TRABAJADORES_QUERY_KEY } from '../constants/trabajadores-query.constants'
import { actualizarTrabajador, cambiarEstadoTrabajador, crearTrabajador, listarTodosTrabajadoresPorFinca, subirFotoTrabajador } from '../services/trabajadores-service'
import { useFotoTrabajador } from './use-foto-trabajador'
import type { TrabajadorFormValues } from '../types/trabajador-form.types'

const TRABAJADOR_INICIAL: TrabajadorFormValues = { nombreCompleto: '', fotoUrl: '', activo: true }
const TRABAJADORES_LISTADO_QUERY_KEY = [TRABAJADORES_QUERY_KEY, FINCA_ACTUAL.id]

interface EstadoFormularioTrabajador {
  values: TrabajadorFormValues
  trabajadorEditando: Trabajador | null
  error: string | null
  isFormOpen: boolean
}

const FORM_INICIAL: EstadoFormularioTrabajador = {
  values: TRABAJADOR_INICIAL,
  trabajadorEditando: null,
  error: null,
  isFormOpen: false,
}

export function useTrabajadoresCrud() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const [form, setForm] = useState<EstadoFormularioTrabajador>(FORM_INICIAL)
  const { values, trabajadorEditando, error, isFormOpen } = form
  const [isSubmitting, setIsSubmitting] = useState(false)
  const foto = useFotoTrabajador()
  const queryKey = TRABAJADORES_LISTADO_QUERY_KEY
  const { data: trabajadores = [], isLoading } = useQuery({ queryKey, queryFn: () => listarTodosTrabajadoresPorFinca(FINCA_ACTUAL.id) })

  function updateField<K extends keyof TrabajadorFormValues>(field: K, value: TrabajadorFormValues[K]) {
    setForm((current) => ({ ...current, values: { ...current.values, [field]: value } }))
  }

  function editarTrabajador(trabajador: Trabajador) {
    setForm({
      trabajadorEditando: trabajador,
      values: { nombreCompleto: trabajador.nombreCompleto, fotoUrl: trabajador.fotoUrl ?? '', activo: trabajador.activo },
      error: null,
      isFormOpen: true,
    })
    foto.reiniciarFoto(trabajador.fotoUrl)
  }

  function abrirCrear() {
    setForm({ trabajadorEditando: null, values: TRABAJADOR_INICIAL, error: null, isFormOpen: true })
    foto.reiniciarFoto(null)
  }

  function cerrarForm() {
    setForm(FORM_INICIAL)
    foto.reiniciarFoto(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validarNombre()) return
    await guardarTrabajador()
  }

  async function alternarEstado(trabajador: Trabajador) {
    try {
      await cambiarEstadoTrabajador(trabajador)
      await queryClient.invalidateQueries({ queryKey })
      mostrarToast({ type: 'success', title: trabajador.activo ? 'Trabajador inactivado' : 'Trabajador activado' })
    } catch (unknownError) {
      const description = unknownError instanceof Error ? unknownError.message : 'No se pudo cambiar el estado.'
      mostrarToast({ type: 'error', title: 'No se pudo cambiar el estado', description })
    }
  }

  async function guardarTrabajador() {
    setIsSubmitting(true)
    const esCreacion = !trabajadorEditando
    const nombreGuardado = values.nombreCompleto.trim()
    try {
      await guardarSegunModo()
      await queryClient.invalidateQueries({ queryKey })
      cerrarForm()
      if (esCreacion) {
        mostrarToast({ type: 'success', title: 'Trabajador agregado', description: `${nombreGuardado} ya forma parte de ${FINCA_ACTUAL.nombre}.` })
      } else {
        mostrarToast({ type: 'success', title: 'Trabajador editado correctamente' })
      }
    } catch (unknownError) {
      mostrarError(unknownError, 'No se pudo guardar el trabajador.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function validarNombre() {
    if (values.nombreCompleto.trim()) {
      setForm((current) => ({ ...current, error: null }))
      return true
    }
    setForm((current) => ({ ...current, error: 'Escribe el nombre del trabajador.' }))
    return false
  }

  async function guardarSegunModo() {
    const fotoUrl = foto.fotoArchivo ? await subirFotoTrabajador({ fincaId: FINCA_ACTUAL.id, archivo: foto.fotoArchivo }) : values.fotoUrl
    if (trabajadorEditando) return actualizarTrabajador({ ...values, fotoUrl, id: trabajadorEditando.id })
    return crearTrabajador({ ...values, fotoUrl, fincaId: FINCA_ACTUAL.id })
  }

  function mostrarError(unknownError: unknown, fallback: string) {
    const description = unknownError instanceof Error ? unknownError.message : fallback
    setForm((current) => ({ ...current, error: description }))
  }

  return {
    trabajadores,
    values,
    finca: FINCA_ACTUAL,
    trabajadorEditando,
    error: error ?? foto.fotoError,
    isLoading,
    isSubmitting,
    isFormOpen,
    fotoPreviewUrl: foto.fotoPreviewUrl,
    updateField,
    onFotoChange: foto.seleccionarFoto,
    handleSubmit,
    onOpenCreate: abrirCrear,
    onCloseForm: cerrarForm,
    editarTrabajador,
    alternarEstado,
  }
}
