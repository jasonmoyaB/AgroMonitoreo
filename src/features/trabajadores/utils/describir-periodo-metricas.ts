import { descomponerFechaIso, formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import type { TrabajadorMetricasFiltros } from '../types/trabajador-metricas.types'

const FORMATEADOR_MES = new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'UTC' })

export function describirPeriodoMetricas({ anio, fechaInicio, fechaFin }: TrabajadorMetricasFiltros): string {
  if (fechaInicio && fechaFin) return describirRango(fechaInicio, fechaFin)
  if (fechaInicio) return `Desde ${formatearFechaIsoDdMmAaaa(fechaInicio)}`
  if (fechaFin) return `Hasta ${formatearFechaIsoDdMmAaaa(fechaFin)}`
  if (anio !== null) return `Año ${anio}`
  return 'Todo el historial'
}

function describirRango(inicio: string, fin: string): string {
  const rango = `${formatearFechaIsoDdMmAaaa(inicio)} al ${formatearFechaIsoDdMmAaaa(fin)}`
  const fechaInicio = descomponerFechaIso(inicio)
  const fechaFin = descomponerFechaIso(fin)
  if (fechaInicio.anio !== fechaFin.anio || fechaInicio.mes !== fechaFin.mes) return rango
  const mes = FORMATEADOR_MES.format(new Date(Date.UTC(fechaInicio.anio, fechaInicio.mes - 1, 1)))
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fechaInicio.anio} | ${rango}`
}
