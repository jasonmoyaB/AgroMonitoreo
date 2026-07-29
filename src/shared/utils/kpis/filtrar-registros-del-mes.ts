import type { RegistroTrabajo } from '../../types/domain.types'
import { fechaLocalIso } from '../fecha-local'

const LONGITUD_ANIO_MES = 7

// toISOString() da el mes en UTC: desde las 18:00 locales del ultimo dia del mes ya
// devolvia el mes siguiente y los KPIs mensuales se iban a cero hasta medianoche.
function obtenerMesActual(): string {
  return fechaLocalIso().slice(0, LONGITUD_ANIO_MES)
}

export function filtrarRegistrosDelMes(registros: readonly RegistroTrabajo[], mes: string = obtenerMesActual()): RegistroTrabajo[] {
  return registros.filter((registro) => registro.fecha.startsWith(mes))
}
