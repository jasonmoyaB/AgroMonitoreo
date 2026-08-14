export type LaborIconName =
  | 'wheat'
  | 'link'
  | 'scissors'
  | 'leaf'
  | 'knife'
  | 'shovel'
  | 'sprout'
  | 'package'

// valorHora es en colones y valorHoraUsd en dolares: el dia ausente se descuenta con el
// que coincide con la moneda del salario del trabajador. 0 significa "sin definir".
export interface Finca {
  id: string
  nombre: string
  activa: boolean
  valorHora: number
  valorHoraUsd: number
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

// los 4 datos personales viven en datos_trabajadores, no aca (20260814173849): la
// cedula es PII y trabajadores_select_activos_multi_finca abre la tabla a cualquier
// finca. se leen por embed en el mismo select, pero se escriben aparte.
export interface Trabajador {
  id: string
  fincaId: string
  nombreCompleto: string
  fotoUrl: string | null
  activo: boolean
  asegurado: boolean
  cedula: string | null
  fechaIngreso: string | null
  telefono: string | null
}

// vive en salarios_trabajadores, no en trabajadores: RLS es row-level, y las policies
// de trabajadores alcanzan toda la tabla para que traslados pueda listar otras fincas.
// asegurado es la unica excepcion, con el alcance aceptado a proposito: decisiones.md 3b
export interface SalarioTrabajador {
  trabajadorId: string
  nombreCompleto: string
  fotoUrl: string | null
  salarioMensual: number
  moneda: Moneda
  asegurado: boolean
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
