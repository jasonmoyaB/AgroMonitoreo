import { useMemo, useState } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'
import { filtrarTrabajadoresPorNombre } from '../utils/filtrar-trabajadores-por-nombre'

export function useBusquedaTrabajadores(trabajadoresOrdenados: readonly Trabajador[]) {
  const [busqueda, setBusqueda] = useState('')

  const trabajadoresFiltrados = useMemo(
    () => filtrarTrabajadoresPorNombre(trabajadoresOrdenados, busqueda),
    [trabajadoresOrdenados, busqueda]
  )

  return { busqueda, setBusqueda, trabajadoresFiltrados }
}
