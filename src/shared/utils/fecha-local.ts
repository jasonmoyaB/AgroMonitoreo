import { construirFechaIso } from './fecha-iso'

// new Date().toISOString() da la fecha en UTC. Costa Rica es UTC-6, asi que desde las
// 18:00 locales toISOString() ya devolvio el dia siguiente. Sumarle un offset hacia
// que "manana" cayera en pasado manana.
export function fechaLocalIso(offsetDias = 0): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + offsetDias)
  return construirFechaIso({ anio: fecha.getFullYear(), mes: fecha.getMonth() + 1, dia: fecha.getDate() })
}
