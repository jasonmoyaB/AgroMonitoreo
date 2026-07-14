import type { RolNombre } from '../../../shared/types/domain.types'

export interface Supervisor {
  id: string
  email: string
  nombre: string | null
  fincaId: string
  fincaNombre: string
  activo: boolean
  rol: RolNombre
}

export interface ActualizarSupervisorInput {
  id: string
  nombre: string
  rol: RolNombre
  fincaId: string
}
