import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Trabajador, TipoAusencia } from '../../../shared/types/domain.types'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import {
  ASISTENCIA_DIA_QUERY_KEY,
  ASISTENCIA_MES_QUERY_KEY,
  ASISTENCIA_SEMANA_QUERY_KEY,
  ASISTENCIA_TRABAJADORES_AUSENTES_QUERY_KEY,
  ASISTENCIA_TRABAJADOR_QUERY_KEY,
} from '../constants/asistencia-query.constants'
import { TIPO_AUSENCIA_POR_DEFECTO } from '../constants/tipos-ausencia.constants'
import { registrarAusencias } from '../services/asistencia-service'

interface EstadoModalCalendario {
  trabajador: Trabajador | null
  fechas: string[]
  tipo: TipoAusencia
  error: string | null
}

const ESTADO_MODAL_INICIAL: EstadoModalCalendario = { trabajador: null, fechas: [], tipo: TIPO_AUSENCIA_POR_DEFECTO, error: null }

export function useRegistrarAusenciaCalendario() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const hoy = new Date()
  const [estado, setEstado] = useState<EstadoModalCalendario>(ESTADO_MODAL_INICIAL)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trabajador, fechas, tipo, error } = estado

  function abrir(trabajadorSeleccionado: Trabajador) {
    setEstado({ trabajador: trabajadorSeleccionado, fechas: [], tipo: TIPO_AUSENCIA_POR_DEFECTO, error: null })
  }

  function cerrar() {
    if (isSubmitting) return
    limpiar()
  }

  function limpiar() {
    setEstado(ESTADO_MODAL_INICIAL)
  }

  function seleccionarTipo(tipoSeleccionado: TipoAusencia) {
    setEstado((actual) => ({ ...actual, tipo: tipoSeleccionado }))
  }

  function toggleFecha(fecha: string) {
    setEstado((actual) => ({
      ...actual,
      fechas: actual.fechas.includes(fecha) ? actual.fechas.filter((item) => item !== fecha) : [...actual.fechas, fecha].sort(),
    }))
  }

  function cambiarMes(direccion: -1 | 1) {
    const fecha = new Date(anio, mes - 1 + direccion, 1)
    setAnio(fecha.getFullYear())
    setMes(fecha.getMonth() + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trabajador || !validarFechas()) return
    await guardarAusencias(trabajador)
  }

  function validarFechas() {
    if (fechas.length > 0) {
      setEstado((actual) => ({ ...actual, error: null }))
      return true
    }
    setEstado((actual) => ({ ...actual, error: 'Selecciona al menos un dia en el calendario.' }))
    return false
  }

  async function guardarAusencias(trabajadorSeleccionado: Trabajador) {
    setIsSubmitting(true)
    try {
      await registrarAusencias({ fincaId: FINCA_ACTUAL.id, trabajadorId: trabajadorSeleccionado.id, fechas, tipo })
      await invalidarAsistencia(trabajadorSeleccionado.id)
      mostrarToast({ type: 'success', title: 'Ausencia registrada', description: `${trabajadorSeleccionado.nombreCompleto} quedo ausente ${fechas.length} dia(s).` })
      limpiar()
    } catch (unknownError) {
      mostrarError(unknownError)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function invalidarAsistencia(trabajadorId: string) {
    await Promise.all(fechas.map((fecha) => queryClient.invalidateQueries({ queryKey: [ASISTENCIA_DIA_QUERY_KEY, fecha] })))
    await queryClient.invalidateQueries({ queryKey: [ASISTENCIA_MES_QUERY_KEY] })
    await queryClient.invalidateQueries({ queryKey: [ASISTENCIA_SEMANA_QUERY_KEY] })
    await queryClient.invalidateQueries({ queryKey: [ASISTENCIA_TRABAJADOR_QUERY_KEY, FINCA_ACTUAL.id, trabajadorId] })
    await queryClient.invalidateQueries({ queryKey: [ASISTENCIA_TRABAJADORES_AUSENTES_QUERY_KEY, FINCA_ACTUAL.id] })
  }

  function mostrarError(unknownError: unknown) {
    const description = unknownError instanceof Error ? unknownError.message : 'No se pudo registrar la ausencia.'
    setEstado((actual) => ({ ...actual, error: description }))
    mostrarToast({ type: 'error', title: 'No se pudo registrar la ausencia', description })
  }

  return {
    trabajador,
    anio,
    mes,
    fechas,
    tipo,
    error,
    isSubmitting,
    isOpen: trabajador !== null,
    abrir,
    cerrar,
    toggleFecha,
    seleccionarTipo,
    cambiarMes,
    handleSubmit,
    construirFecha: (dia: number) => construirFechaIso({ anio, mes, dia }),
  }
}
