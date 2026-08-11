import type { GrupoSeguro } from '../types/planilla.types'

export const OPCIONES_GRUPO_SEGURO: readonly { valor: GrupoSeguro; etiqueta: string }[] = [
  { valor: 'asegurados', etiqueta: 'Pagar trabajadores asegurados' },
  { valor: 'no_asegurados', etiqueta: 'Pagar trabajadores no asegurados' },
]

export const GRUPO_SEGURO_INICIAL: GrupoSeguro = 'asegurados'
