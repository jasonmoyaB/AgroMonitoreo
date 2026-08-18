import type { RolNombre } from '../../../shared/types/domain.types'

export interface Supervisor {
  id: string
  email: string
  nombre: string | null
  // null = invitado que todavia no tiene finca asignada
  fincaId: string | null
  fincaNombre: string | null
  activo: boolean
  rol: RolNombre
}

export interface ActualizarSupervisorInput {
  id: string
  nombre: string
  rol: RolNombre
  fincaId: string | null
}
