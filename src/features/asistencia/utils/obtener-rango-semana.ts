import type { RangoSemana } from '../types/asistencia.types'

const DIAS_SEMANA = 7
const DOMINGO = 0
const FORMATO_CORTO = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' })
const FORMATO_LARGO = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })

export function obtenerRangoSemana(offsetSemanas: number): RangoSemana {
  const hoy = new Date()
  const diasHastaLunes = hoy.getDay() === DOMINGO ? -6 : 1 - hoy.getDay()

  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() + diasHastaLunes + offsetSemanas * DIAS_SEMANA)

  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + (DIAS_SEMANA - 1))

  return { inicio: aFechaIso(lunes), fin: aFechaIso(domingo), etiqueta: formatearEtiqueta(lunes, domingo) }
}

function aFechaIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function formatearEtiqueta(inicio: Date, fin: Date): string {
  return `${FORMATO_CORTO.format(inicio)} – ${FORMATO_LARGO.format(fin)}`
}
