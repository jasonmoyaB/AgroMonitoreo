import type { Trabajador } from '../../../shared/types/domain.types'

export interface TrabajadorDisponible extends Trabajador {
  fincaOrigenNombre: string | null
}
