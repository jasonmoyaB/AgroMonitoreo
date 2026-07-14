import { useState } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'
import { useTrabajadorMetricas } from './use-trabajador-metricas'

const FILTROS_INICIALES: TrabajadorMetricasFiltros = { anio: null, fechaInicio: null, fechaFin: null }

interface EstadoModalMetricas {
  trabajador: Trabajador | null
  filtros: TrabajadorMetricasFiltros
}

export function useTrabajadorMetricasModal() {
  const [estado, setEstado] = useState<EstadoModalMetricas>({ trabajador: null, filtros: FILTROS_INICIALES })
  const { trabajador, filtros } = estado
  const metricas = useTrabajadorMetricas(trabajador?.id ?? null, filtros)

  function abrir(seleccionado: Trabajador) {
    setEstado({ trabajador: seleccionado, filtros: FILTROS_INICIALES })
  }

  function cerrar() {
    setEstado((actual) => ({ ...actual, trabajador: null }))
  }

  function updateFiltro<K extends keyof TrabajadorMetricasFiltros>(campo: K, valor: TrabajadorMetricasFiltros[K]) {
    setEstado((actual) => ({ ...actual, filtros: { ...actual.filtros, [campo]: valor } }))
  }

  return {
    trabajador,
    isOpen: trabajador !== null,
    filtros,
    ...metricas,
    abrir,
    cerrar,
    updateFiltro,
    resetFiltros: () => setEstado((actual) => ({ ...actual, filtros: FILTROS_INICIALES })),
  }
}
