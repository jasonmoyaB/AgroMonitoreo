import { useMemo, useState } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'
import { FILTROS_INICIALES } from '../constants/trabajador-filtro.constants'
import type { TrabajadoresFiltros } from '../types/trabajador-filtro.types'
import { filtrarTrabajadores } from '../utils/filtrar-trabajadores'

export function useTrabajadoresFiltro(trabajadores: readonly Trabajador[]) {
  const [filtros, setFiltros] = useState<TrabajadoresFiltros>(FILTROS_INICIALES)

  function updateFiltro<K extends keyof TrabajadoresFiltros>(campo: K, valor: TrabajadoresFiltros[K]) {
    setFiltros((actual) => ({ ...actual, [campo]: valor }))
  }

  const trabajadoresFiltrados = useMemo(() => filtrarTrabajadores(trabajadores, filtros), [trabajadores, filtros])

  return { filtros, trabajadoresFiltrados, updateFiltro }
}
