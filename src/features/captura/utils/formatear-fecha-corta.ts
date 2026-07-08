import { MESES } from '../constants/meses.constants'
import { descomponerFechaIso } from './fecha-iso'

export function formatearFechaCorta(fecha: string): string {
  const { anio, mes, dia } = descomponerFechaIso(fecha)
  const abreviatura = MESES.find((opcion) => opcion.valor === mes)?.abreviatura ?? ''
  return `${dia} ${abreviatura} ${anio}`
}
