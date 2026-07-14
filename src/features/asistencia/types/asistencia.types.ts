import type { TipoAusencia } from '../../../shared/types/domain.types'

export interface AsistenciaConTrabajador {
  id: string
  fecha: string
  trabajadorId: string
  trabajadorNombre: string
  tipo: TipoAusencia
}

export interface RangoSemana {
  inicio: string
  fin: string
  etiqueta: string
}
