import type { Trabajador } from '../../../shared/types/domain.types'

interface DatosRow {
  cedula: string | null
  fecha_ingreso: string | null
  telefono: string | null
}

export interface TrabajadorRow {
  id: string
  finca_id: string
  nombre_completo: string
  foto_url: string | null
  activo: boolean
  asegurado: boolean
  // opcional: las lecturas sin el embed no lo traen, y ahi los tres campos quedan null
  datos?: DatosRow | null
}

export function mapearTrabajador(row: TrabajadorRow): Trabajador {
  return {
    id: row.id,
    fincaId: row.finca_id,
    nombreCompleto: row.nombre_completo,
    fotoUrl: row.foto_url,
    activo: row.activo,
    asegurado: row.asegurado,
    cedula: row.datos?.cedula ?? null,
    fechaIngreso: row.datos?.fecha_ingreso ?? null,
    telefono: row.datos?.telefono ?? null,
  }
}
