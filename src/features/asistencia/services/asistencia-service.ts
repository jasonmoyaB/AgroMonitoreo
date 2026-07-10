import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Ausencia } from '../../../shared/types/domain.types'
import type { AsistenciaConTrabajador } from '../types/asistencia.types'

const ASISTENCIA_COLUMNS = 'id, finca_id, trabajador_id, fecha'
const ASISTENCIA_CON_TRABAJADOR_COLUMNS = 'id, fecha, trabajador_id, trabajadores!inner(nombre_completo)'

export async function listarAusentesPorFecha(fincaId: string, fecha: string, client: SupabaseClient = supabase): Promise<Ausencia[]> {
  const { data, error } = await client.from('asistencia').select(ASISTENCIA_COLUMNS).eq('finca_id', fincaId).eq('fecha', fecha)

  if (error) throw new Error(`listarAusentesPorFecha: ${error.message}`)
  return data.map(mapAusencia)
}

export async function listarAsistenciaPorRango(
  fincaId: string,
  desde: string,
  hasta: string,
  client: SupabaseClient = supabase
): Promise<AsistenciaConTrabajador[]> {
  const { data, error } = await client
    .from('asistencia')
    .select(ASISTENCIA_CON_TRABAJADOR_COLUMNS)
    .eq('finca_id', fincaId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })

  if (error) throw new Error(`listarAsistenciaPorRango: ${error.message}`)
  // trabajador_id no es unico por si solo (unico es trabajador_id+fecha), asi que el generador de tipos
  // marca el embed como array; PostgREST igual devuelve un objeto unico por ser FK muchos-a-uno.
  return (data as unknown as AsistenciaConTrabajadorRow[]).map(mapAsistenciaConTrabajador)
}

export async function listarAusenciasPorTrabajador(
  fincaId: string,
  trabajadorId: string,
  client: SupabaseClient = supabase
): Promise<Ausencia[]> {
  const { data, error } = await client
    .from('asistencia')
    .select(ASISTENCIA_COLUMNS)
    .eq('finca_id', fincaId)
    .eq('trabajador_id', trabajadorId)
    .order('fecha', { ascending: false })

  if (error) throw new Error(`listarAusenciasPorTrabajador: ${error.message}`)
  return data.map(mapAusencia)
}

export async function registrarAusencias(
  fincaId: string,
  trabajadorId: string,
  fechas: readonly string[],
  client: SupabaseClient = supabase
): Promise<void> {
  const registros = fechas.map((fecha) => ({ finca_id: fincaId, trabajador_id: trabajadorId, fecha }))
  const { error } = await client.from('asistencia').upsert(registros, { onConflict: 'trabajador_id,fecha' })

  if (error) throw new Error(`registrarAusencias: ${error.message}`)
}

export async function quitarAusente(fincaId: string, trabajadorId: string, fecha: string, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from('asistencia').delete().eq('finca_id', fincaId).eq('trabajador_id', trabajadorId).eq('fecha', fecha)

  if (error) throw new Error(`quitarAusente: ${error.message}`)
}

interface AusenciaRow {
  id: string
  finca_id: string
  trabajador_id: string
  fecha: string
}

function mapAusencia(row: AusenciaRow): Ausencia {
  return { id: row.id, fincaId: row.finca_id, trabajadorId: row.trabajador_id, fecha: row.fecha }
}

interface AsistenciaConTrabajadorRow {
  id: string
  fecha: string
  trabajador_id: string
  trabajadores: { nombre_completo: string }
}

function mapAsistenciaConTrabajador(row: AsistenciaConTrabajadorRow): AsistenciaConTrabajador {
  return { id: row.id, fecha: row.fecha, trabajadorId: row.trabajador_id, trabajadorNombre: row.trabajadores.nombre_completo }
}
