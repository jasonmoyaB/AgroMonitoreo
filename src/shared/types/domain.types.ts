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
  valorHora: number
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

export type Moneda = 'usd' | 'colones'

export interface TrabajadorNombrable {
  id: string
  nombreCompleto: string
}

export interface Trabajador {
  id: string
  fincaId: string
  nombreCompleto: string
  fotoUrl: string | null
  activo: boolean
}

// vive en salarios_trabajadores, no en trabajadores: RLS es row-level, y las policies
// de trabajadores alcanzan toda la tabla para que traslados pueda listar otras fincas
export interface SalarioTrabajador {
  trabajadorId: string
  nombreCompleto: string
  fotoUrl: string | null
  salarioMensual: number
  moneda: Moneda
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
