import type { TipoAusencia } from '../../../shared/types/domain.types'

export interface OpcionTipoAusencia {
  id: TipoAusencia
  nombre: string
}

export const TIPOS_AUSENCIA: readonly OpcionTipoAusencia[] = [
  { id: 'vacaciones', nombre: 'Vacaciones' },
  { id: 'permisos', nombre: 'Permiso' },
  { id: 'permisos_medicos', nombre: 'Permiso médico' },
]

export const TIPO_AUSENCIA_POR_DEFECTO: TipoAusencia = 'permisos'
