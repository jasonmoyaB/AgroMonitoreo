import { MESES } from '../constants/meses.constants'
import { descomponerFechaIso } from './fecha-iso'

// 'YYYY-MM' -> 'Agosto 2026'. Lo usan los tres dashboards para titular sus graficos, y
// vive fuera de los hooks para que el supervisor no dependa de un hook de admin.
export function formatearPeriodoNombre(anioMes: string): string {
  const { anio, mes } = descomponerFechaIso(anioMes)
  return `${MESES[mes - 1].nombre} ${anio}`
}
