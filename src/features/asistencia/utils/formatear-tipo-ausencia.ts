import type { TipoAusencia } from '../../../shared/types/domain.types'
import { TIPOS_AUSENCIA } from '../constants/tipos-ausencia.constants'

export function formatearTipoAusencia(tipo: TipoAusencia): string {
  return TIPOS_AUSENCIA.find((opcion) => opcion.id === tipo)?.nombre ?? tipo
}
