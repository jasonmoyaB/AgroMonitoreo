import type { NumeroQuincena } from '../types/planilla.types'

export const PLANILLA_QUERY_KEY = 'planilla'

export const PRIMERA_QUINCENA: NumeroQuincena = 1
export const SEGUNDA_QUINCENA: NumeroQuincena = 2
export const ULTIMO_DIA_PRIMERA_QUINCENA = 15

export const OPCIONES_QUINCENA = [
  { valor: PRIMERA_QUINCENA, etiqueta: 'Primera quincena (1 al 15)' },
  { valor: SEGUNDA_QUINCENA, etiqueta: 'Segunda quincena (16 a fin de mes)' },
] as const
