import { descomponerFechaIso, type FechaDescompuesta } from '../../../shared/utils/fecha-iso'
import { ANIO_MINIMO } from '../constants/captura.constants'
import { obtenerLimitesFecha } from './obtener-limites-fecha'

// Mantiene la fecha elegida dentro de lo permitido: el anio no pasa del anio en curso, el
// mes no pasa del mes de hoy y el dia no pasa del ultimo dia valido de ese mes.
export function ajustarFechaALimites(fecha: FechaDescompuesta, hoyIso: string): FechaDescompuesta {
  const anio = Math.min(Math.max(fecha.anio, ANIO_MINIMO), descomponerFechaIso(hoyIso).anio)
  const mes = Math.min(fecha.mes, obtenerLimitesFecha(anio, fecha.mes, hoyIso).mesMaximo)
  const dia = Math.min(fecha.dia, obtenerLimitesFecha(anio, mes, hoyIso).diaMaximo)
  return { anio, mes, dia }
}
