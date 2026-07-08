const LONGITUD_MIN = 2

interface FechaDescompuesta {
  anio: number
  mes: number
  dia: number
}

function conCero(valor: number): string {
  return valor.toString().padStart(LONGITUD_MIN, '0')
}

export function construirFechaIso({ anio, mes, dia }: FechaDescompuesta): string {
  return `${anio}-${conCero(mes)}-${conCero(dia)}`
}

export function descomponerFechaIso(fecha: string): FechaDescompuesta {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return { anio, mes, dia }
}
