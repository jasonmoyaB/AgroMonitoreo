import { descomponerFechaIso } from './fecha-iso'

const FORMATEADOR_FECHA_CORTA = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export function formatearFechaCorta(fecha: Date): string {
  return FORMATEADOR_FECHA_CORTA.format(fecha)
}

// new Date('2026-08-19') se parsea como UTC y en Costa Rica pinta el dia anterior:
// hay que construir la fecha con las partes locales.
export function formatearFechaIsoCorta(fechaIso: string): string {
  const { anio, mes, dia } = descomponerFechaIso(fechaIso)
  return formatearFechaCorta(new Date(anio, mes - 1, dia))
}
