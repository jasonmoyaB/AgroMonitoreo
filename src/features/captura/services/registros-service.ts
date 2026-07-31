import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RegistroTrabajo } from '../../../shared/types/domain.types'
import { descomponerFechaIso, rangoIsoDelMes } from '../../../shared/utils/fecha-iso'

const REGISTROS_COLUMNS = 'id, finca_id, trabajador_id, tipo_labor_id, fecha, horas, cantidad, registrado_por, creado_en'
const CONFLICTO_UNICO_POR_DIA = 'trabajador_id,tipo_labor_id,fecha'
const TAMANO_PAGINA = 1000

export async function listarRegistrosPorFecha(fecha: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { data, error } = await client.from('registros_trabajo').select(REGISTROS_COLUMNS).eq('fecha', fecha)

  if (error) throw new Error(`listarRegistrosPorFecha: ${error.message}`)
  return data.map(mapRegistro)
}

// PostgREST corta cada respuesta en max-rows (1000): traer la tabla entera truncaba en
// silencio apenas pasado el primer mes de uso y los KPIs salian bajos sin ningun aviso.
// Se acota al mes pedido y se pagina hasta que la base deja de devolver filas.
export async function listarRegistrosDelMes(anioMes: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { desde, hastaExclusivo } = rangoIsoDelMes(anioMes)
  const registros: RegistroTrabajo[] = []

  for (;;) {
    const { data, error } = await client
      .from('registros_trabajo')
      .select(REGISTROS_COLUMNS)
      .gte('fecha', desde)
      .lt('fecha', hastaExclusivo)
      .order('fecha')
      .order('id')
      .range(registros.length, registros.length + TAMANO_PAGINA - 1)

    if (error) throw new Error(`listarRegistrosDelMes: ${error.message}`)
    if (data.length === 0) return registros
    registros.push(...data.map(mapRegistro))
  }
}

export async function listarRegistrosPorTrabajador(trabajadorId: string, client: SupabaseClient = supabase): Promise<RegistroTrabajo[]> {
  const { data, error } = await client.from('registros_trabajo').select(REGISTROS_COLUMNS).eq('trabajador_id', trabajadorId)

  if (error) throw new Error(`listarRegistrosPorTrabajador: ${error.message}`)
  return data.map(mapRegistro)
}

export async function obtenerAnioPrimerRegistro(client: SupabaseClient = supabase): Promise<number | null> {
  const { data, error } = await client.from('registros_trabajo').select('fecha').order('fecha').limit(1).maybeSingle()

  if (error) throw new Error(`obtenerAnioPrimerRegistro: ${error.message}`)
  return data ? descomponerFechaIso(data.fecha).anio : null
}

export async function crearRegistro(registro: RegistroTrabajo, client: SupabaseClient = supabase): Promise<RegistroTrabajo> {
  const { data, error } = await client
    .from('registros_trabajo')
    .upsert(
      {
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
