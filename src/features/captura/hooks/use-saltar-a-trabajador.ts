import { useCallback } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'
import type { RangoLetras } from '../constants/rangos-alfabeto.constants'
import { encontrarPrimerTrabajadorPorRango } from '../utils/encontrar-primer-trabajador-por-rango'

export function useSaltarATrabajador(trabajadoresOrdenados: readonly Trabajador[]) {
  return useCallback(
    (rango: RangoLetras) => {
      const trabajador = encontrarPrimerTrabajadorPorRango(trabajadoresOrdenados, rango)
      if (!trabajador) return
      document.getElementById(`trabajador-${trabajador.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    [trabajadoresOrdenados]
  )
}
