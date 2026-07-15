import type { RolNombre } from '../../../shared/types/domain.types'

export const ROL_LABELS: Record<RolNombre, string> = {
  supervisor: 'Supervisor',
  admin_oficina: 'Admin oficina',
}

export const ROLES_DISPONIBLES: RolNombre[] = ['supervisor', 'admin_oficina']
