import type { TrabajadorNombrable } from '../../../shared/types/domain.types'
import type { RangoLetras } from '../constants/rangos-alfabeto.constants'

function obtenerInicial(nombreCompleto: string): string {
  return nombreCompleto.trim().charAt(0).toUpperCase()
}

export function encontrarPrimerTrabajadorPorRango<T extends TrabajadorNombrable>(
  trabajadoresOrdenados: readonly T[],
  rango: RangoLetras
): T | undefined {
  return trabajadoresOrdenados.find((trabajador) => {
    const inicial = obtenerInicial(trabajador.nombreCompleto)
    return inicial >= rango.desde && inicial <= rango.hasta
  })
}
