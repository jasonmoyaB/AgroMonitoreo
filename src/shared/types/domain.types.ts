export type LaborIconName =
  | 'wheat'
  | 'link'
  | 'scissors'
  | 'leaf'
  | 'knife'
  | 'shovel'
  | 'sprout'
  | 'package'

export interface Finca {
  id: string
  nombre: string
  activa: boolean
}

export interface TipoLabor {
  id: string
  codigo: string
  nombre: string
  icono: LaborIconName
  color: string
  tieneCantidad: boolean
  unidadMedida: string | null
  pasoCantidad: number
  orden: number
}

export interface Trabajador {
  id: string
  fincaId: string
  nombreCompleto: string
  fotoUrl: string | null
  activo: boolean
}

export interface RegistroTrabajo {
  id: string
  fincaId: string
  trabajadorId: string
  tipoLaborId: string
  fecha: string
  horas: number
  cantidad: number | null
  registradoPor: string
  createdAt: string
}

export type TipoAusencia = 'vacaciones' | 'permisos' | 'permisos_medicos'

export interface Ausencia {
  id: string
  fincaId: string
  trabajadorId: string
  fecha: string
  tipo: TipoAusencia
}

export type RolNombre = 'admin_oficina' | 'supervisor'

export interface Usuario {
  id: string
  email: string
  nombre: string | null
  fincaId: string
  fincaNombre: string
  activo: boolean
  rol: RolNombre
}
