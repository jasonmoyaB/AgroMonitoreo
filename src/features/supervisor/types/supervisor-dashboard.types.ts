import type { TipoLabor } from '../../../shared/types/domain.types'

export interface LaborTask {
  id: string
  tipoLabor: TipoLabor
  opciones: readonly LaborTaskOption[]
}

export interface LaborTaskOption {
  tipoLabor: TipoLabor
  etiqueta: string
}
