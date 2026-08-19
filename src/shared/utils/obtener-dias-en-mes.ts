export function obtenerDiasEnMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate()
}
