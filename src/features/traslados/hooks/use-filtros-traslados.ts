import { useMemo, useState } from 'react'
import type { Traslado, TrasladosFiltros } from '../types/traslado.types'
import { FILTROS_TRASLADOS_VACIOS, filtrarTraslados } from '../utils/filtrar-traslados'

export function useFiltrosTraslados(traslados: readonly Traslado[], fincaPropiaId = '') {
  const [filtros, setFiltros] = useState<TrasladosFiltros>(FILTROS_TRASLADOS_VACIOS)

  const trasladosFiltrados = useMemo(() => filtrarTraslados(traslados, filtros, fincaPropiaId), [traslados, filtros, fincaPropiaId])

  function setFiltro<K extends keyof TrasladosFiltros>(campo: K, valor: TrasladosFiltros[K]) {
    setFiltros((previos) => ({ ...previos, [campo]: valor }))
  }

  return {
    filtros,
    setFiltro,
    resetFiltros: () => setFiltros(FILTROS_TRASLADOS_VACIOS),
    trasladosFiltrados,
  }
}
