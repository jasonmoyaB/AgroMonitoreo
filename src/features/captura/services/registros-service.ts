import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'

const REGISTROS_COLUMNS = 'id, finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por, creado_en'
const CONFLICTO_UNICO_POR_DIA = 'trabajador_id,tipo_labor_id,fecha'

export async function listarRegistrosPorFecha(fecha: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { data, error } = await client.from('registros_trabajo').select(REGISTROS_COLUMNS).eq('fecha', fecha)

  if (error) throw new Error(`listarRegistrosPorFecha: ${error.message}`)
  return data.map(mapRegistro)
}

export async function listarTodosRegistros(client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { data, error } = await client.from('registros_trabajo').select(REGISTROS_COLUMNS)

  if (error) throw new Error(`listarTodosRegistros: ${error.message}`)
  return data.map(mapRegistro)
}

export async function crearRegistro(registro: RegistroTrabajo, client: SupabaseClient = supabase): Promise<RegistroTrabajo> {
  const { data, error } = await client
    .from('registros_trabajo')
    .upsert(
      {
        id: registro.id,
        finca_id: registro.fincaId,
        trabajador_id: registro.trabajadorId,
        tipo_labor_id: registro.tipoLaborId,
        fecha: registro.fecha,
        horas: registro.horas,
        cantidad: registro.cantidad,
      },
      { onConflict: CONFLICTO_UNICO_POR_DIA }
    )
    .select(REGISTROS_COLUMNS)
    .single()

  if (error) throw new Error(`crearRegistro: ${error.message}`)
  return mapRegistro(data)
}

interface RegistroRow {
  id: string
  finca_id: string
  trabajador_id: string
  tipo_labor_id: string
  fecha: string
  horas: number
  cantidad: number | null
  registrado_por: string
  creado_en: string
}

function mapRegistro(row: RegistroRow): RegistroTrabajo {
  return {
    id: row.id,
    fincaId: row.finca_id,
    trabajadorId: row.trabajador_id,
    tipoLaborId: row.tipo_labor_id,
    fecha: row.fecha,
    horas: row.horas,
    cantidad: row.cantidad,
    registradoPor: row.registrado_por,
    createdAt: row.creado_en,
  }
}
