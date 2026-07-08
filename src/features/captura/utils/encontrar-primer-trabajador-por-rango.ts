import type { Trabajador } from '../../../shared/types/domain.types'
import type { RangoLetras } from '../constants/rangos-alfabeto.constants'

function obtenerInicial(nombreCompleto: string): string {
  return nombreCompleto.trim().charAt(0).toUpperCase()
}

export function encontrarPrimerTrabajadorPorRango(
  trabajadoresOrdenados: readonly Trabajador[],
  rango: RangoLetras
): Trabajador | undefined {
  return trabajadoresOrdenados.find((trabajador) => {
    const inicial = obtenerInicial(trabajador.nombreCompleto)
    return inicial >= rango.desde && inicial <= rango.hasta
  })
}
