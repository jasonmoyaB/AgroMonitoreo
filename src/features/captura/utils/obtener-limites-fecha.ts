import { descomponerFechaIso } from '../../../shared/utils/fecha-iso'
import { obtenerDiasEnMes } from './obtener-dias-en-mes'

const DICIEMBRE = 12

interface LimitesFecha {
  mesMaximo: number
  diaMaximo: number
}

// El supervisor puede llenar dias que se le olvidaron, nunca adelantarse: dentro del anio
// en curso el tope es el mes de hoy, y dentro de ese mes el tope es el dia de hoy.
export function obtenerLimitesFecha(anio: number, mes: number, hoyIso: string): LimitesFecha {
  const hoy = descomponerFechaIso(hoyIso)
  const esAnioEnCurso = anio === hoy.anio
  return {
    mesMaximo: esAnioEnCurso ? hoy.mes : DICIEMBRE,
    diaMaximo: esAnioEnCurso && mes === hoy.mes ? hoy.dia : obtenerDiasEnMes(anio, mes),
  }
}
