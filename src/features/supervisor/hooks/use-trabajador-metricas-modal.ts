import { useState } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'
import { useTrabajadorMetricas } from './use-trabajador-metricas'

const FILTROS_INICIALES: TrabajadorMetricasFiltros = { anio: null, fechaInicio: null, fechaFin: null }

export function useTrabajadorMetricasModal() {
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null)
  const [filtros, setFiltros] = useState<TrabajadorMetricasFiltros>(FILTROS_INICIALES)
  const metricas = useTrabajadorMetricas(trabajador?.id ?? null, filtros)

  function abrir(seleccionado: Trabajador) {
    setTrabajador(seleccionado)
    setFiltros(FILTROS_INICIALES)
  }

  function cerrar() {
    setTrabajador(null)
  }

  function updateFiltro<K extends keyof TrabajadorMetricasFiltros>(campo: K, valor: TrabajadorMetricasFiltros[K]) {
    setFiltros((current) => ({ ...current, [campo]: valor }))
  }

  return {
    trabajador,
    isOpen: trabajador !== null,
    filtros,
    ...metricas,
    abrir,
    cerrar,
    updateFiltro,
    resetFiltros: () => setFiltros(FILTROS_INICIALES),
  }
}
