import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { EstadoTraslado, SolicitarTrasladoInput, Traslado, TrabajadorOtraFinca, TrabajadorPrestado, TrabajadorTrasladadoHoy } from '../types/traslado.types'

const TRASLADO_COLUMNS =
  'id, trabajador_id, fecha, estado, finca_origen_id, finca_destino_id, ' +
  'trabajador:trabajadores(nombre_completo), ' +
  'finca_origen:fincas!traslados_trabajadores_finca_origen_id_fkey(nombre), ' +
  'finca_destino:fincas!traslados_trabajadores_finca_destino_id_fkey(nombre)'

interface TrasladoRow {
  id: string
  trabajador_id: string
  fecha: string
  estado: EstadoTraslado
  finca_origen_id: string
  finca_destino_id: string
  trabajador: { nombre_completo: string } | null
  finca_origen: { nombre: string } | null
  finca_destino: { nombre: string } | null
}

export async function listarTrabajadoresOtrasFincas(fincaPropiaId: string, client: SupabaseClient = supabase): Promise<TrabajadorOtraFinca[]> {
  const { data, error } = await client
    .from('trabajadores')
    .select('id, nombre_completo, finca_id, finca:fincas(nombre)')
    .neq('finca_id', fincaPropiaId)
    .eq('activo', true)
    .order('finca_id', { ascending: true })
    .order('nombre_completo', { ascending: true })
    .returns<{ id: string; nombre_completo: string; finca_id: string; finca: { nombre: string } | null }[]>()

  if (error) throw new Error(`listarTrabajadoresOtrasFincas: ${error.message}`)
  if (!data) throw new Error('listarTrabajadoresOtrasFincas: No data returned')
  return data.map((row) => ({ id: row.id, nombreCompleto: row.nombre_completo, fincaId: row.finca_id, fincaNombre: row.finca?.nombre ?? row.finca_id }))
}

export async function solicitarTraslado(input: SolicitarTrasladoInput, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from('traslados_trabajadores').insert({
    trabajador_id: input.trabajadorId,
    finca_origen_id: input.fincaOrigenId,
    finca_destino_id: input.fincaDestinoId,
    fecha: input.fecha,
  })

  if (error) throw new Error(`solicitarTraslado: ${error.message}`)
}

export async function listarMisTraslados(fincaId: string, client: SupabaseClient = supabase): Promise<Traslado[]> {
  // dos .eq() en vez de un .or(): .or() recibe un string de filtro y no acepta
  // parametros, asi que fincaId se interpolaba sin escapar
  const consulta = (columna: 'finca_origen_id' | 'finca_destino_id') =>
    client.from('traslados_trabajadores').select(TRASLADO_COLUMNS).eq(columna, fincaId).returns<TrasladoRow[]>()

  const [origen, destino] = await Promise.all([consulta('finca_origen_id'), consulta('finca_destino_id')])

  const error = origen.error ?? destino.error
  if (error) throw new Error(`listarMisTraslados: ${error.message}`)

  return [...(origen.data ?? []), ...(destino.data ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(mapTraslado)
}

export async function listarTrasladosPendientes(client: SupabaseClient = supabase): Promise<Traslado[]> {
  const { data, error } = await client
    .from('traslados_trabajadores')
    .select(TRASLADO_COLUMNS)
    .eq('estado', 'pendiente')
    .order('fecha', { ascending: true })
    .returns<TrasladoRow[]>()

  if (error) throw new Error(`listarTrasladosPendientes: ${error.message}`)
  if (!data) throw new Error('listarTrasladosPendientes: No data returned')
  return data.map(mapTraslado)
}

export async function listarTrasladosResueltos(client: SupabaseClient = supabase): Promise<Traslado[]> {
  const { data, error } = await client
    .from('traslados_trabajadores')
    .select(TRASLADO_COLUMNS)
    .neq('estado', 'pendiente')
    .order('fecha', { ascending: false })
    .returns<TrasladoRow[]>()

  if (error) throw new Error(`listarTrasladosResueltos: ${error.message}`)
  if (!data) throw new Error('listarTrasladosResueltos: No data returned')
  return data.map(mapTraslado)
}

export async function resolverTraslado(id: string, estado: Extract<EstadoTraslado, 'aprobado' | 'rechazado'>, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from('traslados_trabajadores').update({ estado }).eq('id', id)
  if (error) throw new Error(`resolverTraslado: ${error.message}`)
}

interface TrabajadorPrestadoRow {
  trabajador: { id: string; finca_id: string; nombre_completo: string; foto_url: string | null; activo: boolean } | null
  finca_origen: { nombre: string } | null
}

export async function listarTrabajadoresPrestadosHoy(fincaDestinoId: string, fecha: string, client: SupabaseClient = supabase): Promise<TrabajadorPrestado[]> {
  const { data, error } = await client
    .from('traslados_trabajadores')
    .select('trabajador:trabajadores(id, finca_id, nombre_completo, foto_url, activo), finca_origen:fincas!traslados_trabajadores_finca_origen_id_fkey(nombre)')
    .eq('finca_destino_id', fincaDestinoId)
    .eq('fecha', fecha)
    .eq('estado', 'aprobado')
    .returns<TrabajadorPrestadoRow[]>()

  if (error) throw new Error(`listarTrabajadoresPrestadosHoy: ${error.message}`)
  if (!data) throw new Error('listarTrabajadoresPrestadosHoy: No data returned')
  return data
    .filter((row): row is TrabajadorPrestadoRow & { trabajador: NonNullable<TrabajadorPrestadoRow['trabajador']> } => row.trabajador !== null)
    .map((row) => ({
      id: row.trabajador.id,
      fincaId: row.trabajador.finca_id,
      nombreCompleto: row.trabajador.nombre_completo,
      fotoUrl: row.trabajador.foto_url,
      activo: row.trabajador.activo,
      fincaOrigenNombre: row.finca_origen?.nombre ?? row.trabajador.finca_id,
    }))
}

interface TrabajadorTrasladadoHoyRow {
  trabajador_id: string
  finca_destino_id: string
  finca_destino: { nombre: string } | null
}

export async function listarTrabajadoresTrasladadosHoy(
  fincaOrigenId: string,
  fecha: string,
  client: SupabaseClient = supabase
): Promise<TrabajadorTrasladadoHoy[]> {
  const { data, error } = await client
    .from('traslados_trabajadores')
    .select('trabajador_id, finca_destino_id, finca_destino:fincas!traslados_trabajadores_finca_destino_id_fkey(nombre)')
    .eq('finca_origen_id', fincaOrigenId)
    .eq('fecha', fecha)
    .eq('estado', 'aprobado')
    .returns<TrabajadorTrasladadoHoyRow[]>()

  if (error) throw new Error(`listarTrabajadoresTrasladadosHoy: ${error.message}`)
  return data.map((row) => ({ trabajadorId: row.trabajador_id, fincaDestinoNombre: row.finca_destino?.nombre ?? row.finca_destino_id }))
}

function mapTraslado(row: TrasladoRow): Traslado {
  return {
    id: row.id,
    trabajadorId: row.trabajador_id,
    trabajadorNombre: row.trabajador?.nombre_completo ?? '',
    fincaOrigenId: row.finca_origen_id,
    fincaOrigenNombre: row.finca_origen?.nombre ?? row.finca_origen_id,
    fincaDestinoId: row.finca_destino_id,
    fincaDestinoNombre: row.finca_destino?.nombre ?? row.finca_destino_id,
    fecha: row.fecha,
    estado: row.estado,
  }
}
