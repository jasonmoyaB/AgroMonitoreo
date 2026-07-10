import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { useToastStore } from '../../../shared/stores/toast-store'
import type { Trabajador } from '../../../shared/types/domain.types'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import {
  ASISTENCIA_DIA_QUERY_KEY,
  ASISTENCIA_MES_QUERY_KEY,
  ASISTENCIA_SEMANA_QUERY_KEY,
  ASISTENCIA_TRABAJADORES_AUSENTES_QUERY_KEY,
  ASISTENCIA_TRABAJADOR_QUERY_KEY,
} from '../constants/asistencia-query.constants'
import { registrarAusencias } from '../services/asistencia-service'

export function useRegistrarAusenciaCalendario() {
  const queryClient = useQueryClient()
  const mostrarToast = useToastStore((state) => state.mostrarToast)
  const hoy = new Date()
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [fechas, setFechas] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function abrir(trabajadorSeleccionado: Trabajador) {
    setTrabajador(trabajadorSeleccionado)
    setFechas([])
    setError(null)
  }

  function cerrar() {
    if (isSubmitting) return
    limpiar()
  }

  function limpiar() {
    setTrabajador(null)
    setFechas([])
    setError(null)
  }

  function toggleFecha(fecha: string) {
    setFechas((actuales) => (actuales.includes(fecha) ? actuales.filter((item) => item !== fecha) : [...actuales, fecha].sort()))
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
    setError(null)
    if (fechas.length > 0) return true
    setError('Selecciona al menos un dia en el calendario.')
    return false
  }

  async function guardarAusencias(trabajadorSeleccionado: Trabajador) {
    setIsSubmitting(true)
    try {
      await registrarAusencias(FINCA_ACTUAL.id, trabajadorSeleccionado.id, fechas)
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
    setError(description)
    mostrarToast({ type: 'error', title: 'No se pudo registrar la ausencia', description })
  }

  return {
    trabajador,
    anio,
    mes,
    fechas,
    error,
    isSubmitting,
    isOpen: trabajador !== null,
    abrir,
    cerrar,
    toggleFecha,
    cambiarMes,
    handleSubmit,
    construirFecha: (dia: number) => construirFechaIso({ anio, mes, dia }),
  }
}
