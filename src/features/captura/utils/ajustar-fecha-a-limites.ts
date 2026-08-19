import type { FechaDescompuesta } from '../../../shared/utils/fecha-iso'
import { obtenerLimitesFecha } from './obtener-limites-fecha'

// Mantiene la fecha elegida dentro de lo permitido: el mes no pasa del mes de hoy y el
// dia no pasa del ultimo dia valido de ese mes.
export function ajustarFechaALimites(fecha: FechaDescompuesta, hoyIso: string): FechaDescompuesta {
  const mes = Math.min(fecha.mes, obtenerLimitesFecha(fecha.anio, fecha.mes, hoyIso).mesMaximo)
  const dia = Math.min(fecha.dia, obtenerLimitesFecha(fecha.anio, mes, hoyIso).diaMaximo)
  return { anio: fecha.anio, mes, dia }
}
