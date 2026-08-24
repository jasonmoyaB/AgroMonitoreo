const LONGITUD_MIN = 2
const DICIEMBRE = 12

export interface FechaDescompuesta {
  anio: number
  mes: number
  dia: number
}

interface RangoIso {
  desde: string
  hastaExclusivo: string
}

function conCero(valor: number): string {
  return valor.toString().padStart(LONGITUD_MIN, '0')
}

export function construirFechaIso({ anio, mes, dia }: FechaDescompuesta): string {
  return `${anio}-${conCero(mes)}-${conCero(dia)}`
}

export function construirAnioMes(anio: number, mes: number): string {
  return `${anio}-${conCero(mes)}`
}

// hastaExclusivo es el dia 1 del mes siguiente y no el 31: '2026-02-31' no es una fecha
// valida y Postgres rechaza el cast al comparar contra una columna date.
export function rangoIsoDelMes(anioMes: string): RangoIso {
  const { anio, mes } = descomponerFechaIso(anioMes)
  const esFinDeAnio = mes === DICIEMBRE
  const siguiente = construirAnioMes(esFinDeAnio ? anio + 1 : anio, esFinDeAnio ? 1 : mes + 1)
  return { desde: `${anioMes}-01`, hastaExclusivo: `${siguiente}-01` }
}

export function descomponerFechaIso(fecha: string): FechaDescompuesta {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return { anio, mes, dia }
}

export function formatearFechaIsoDdMmAaaa(fecha: string): string {
  const { anio, mes, dia } = descomponerFechaIso(fecha)
  return `${conCero(dia)}/${conCero(mes)}/${anio}`
}

export function formatearFechaIsoDdMm(fecha: string): string {
  const { mes, dia } = descomponerFechaIso(fecha)
  return `${conCero(dia)}/${conCero(mes)}`
}
