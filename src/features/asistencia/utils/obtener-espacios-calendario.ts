import { DOMINGO } from '../constants/calendario.constants'

export function obtenerEspaciosCalendario(anio: number, mes: number): number {
  const diaSemana = new Date(anio, mes - 1, 1).getDay()
  return diaSemana === DOMINGO ? 6 : diaSemana - 1
}
