import { construirFechaIso } from '../../../shared/utils/fecha-iso'
import { obtenerDiasEnMes } from '../../../shared/utils/obtener-dias-en-mes'
import { PRIMERA_QUINCENA, ULTIMO_DIA_PRIMERA_QUINCENA } from '../constants/quincena.constants'
import type { NumeroQuincena, RangoQuincena } from '../types/planilla.types'

interface ObtenerRangoQuincenaInput {
  anio: number
  mes: number
  quincena: NumeroQuincena
}

// corte calendario 1-15 / 16-fin de mes, confirmado con el usuario. no reutiliza
// obtener-rango-semana de asistencia: ese es lunes-domingo, otro proposito.
export function obtenerRangoQuincena({ anio, mes, quincena }: ObtenerRangoQuincenaInput): RangoQuincena {
  if (quincena === PRIMERA_QUINCENA) {
    return {
      inicio: construirFechaIso({ anio, mes, dia: 1 }),
      fin: construirFechaIso({ anio, mes, dia: ULTIMO_DIA_PRIMERA_QUINCENA }),
    }
  }

  return {
    inicio: construirFechaIso({ anio, mes, dia: ULTIMO_DIA_PRIMERA_QUINCENA + 1 }),
    fin: construirFechaIso({ anio, mes, dia: obtenerDiasEnMes(anio, mes) }),
  }
}
