import { construirFechaIso } from './fecha-iso'

const LONGITUD_ANIO_MES = 7

// new Date().toISOString() da la fecha en UTC. Costa Rica es UTC-6, asi que desde las
// 18:00 locales toISOString() ya devolvio el dia siguiente. Sumarle un offset hacia
// que "manana" cayera en pasado manana.
export function fechaLocalIso(offsetDias = 0): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + offsetDias)
  return construirFechaIso({ anio: fecha.getFullYear(), mes: fecha.getMonth() + 1, dia: fecha.getDate() })
}

export function anioMesLocal(): string {
  return fechaLocalIso().slice(0, LONGITUD_ANIO_MES)
}
