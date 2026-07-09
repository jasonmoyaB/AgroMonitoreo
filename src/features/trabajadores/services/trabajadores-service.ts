import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Trabajador } from '../../../shared/types/domain.types'
import { BUCKET_FOTOS_TRABAJADORES, EXTENSION_POR_MIME, type TipoMimePermitido } from '../constants/foto-trabajador.constants'
import type { ActualizarTrabajadorInput, CrearTrabajadorInput } from '../types/trabajador-form.types'

const TRABAJADORES_COLUMNS = 'id, finca_id, nombre_completo, foto_url, activo'

export async function subirFotoTrabajador(input: { fincaId: string; archivo: File }, client: SupabaseClient = supabase): Promise<string> {
  const extension = EXTENSION_POR_MIME[input.archivo.type as TipoMimePermitido]
  const ruta = `${input.fincaId}/${crypto.randomUUID()}.${extension}`

  const { error } = await client.storage.from(BUCKET_FOTOS_TRABAJADORES).upload(ruta, input.archivo, {
    contentType: input.archivo.type,
    cacheControl: '3600',
  })
  if (error) throw new Error(`subirFotoTrabajador: ${error.message}`)

  return client.storage.from(BUCKET_FOTOS_TRABAJADORES).getPublicUrl(ruta).data.publicUrl
}

export async function listarTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client
    .from('trabajadores')
    .select(TRABAJADORES_COLUMNS)
    .eq('finca_id', fincaId)
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throw new Error(`listarTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapTrabajador)
}

export async function listarTodosTrabajadoresPorFinca(fincaId: string, client: SupabaseClient = supabase): Promise<Trabajador[]> {
  const { data, error } = await client.from('trabajadores').select(TRABAJADORES_COLUMNS).eq('finca_id', fincaId).order('nombre_completo', { ascending: true })

  if (error) throw new Error(`listarTodosTrabajadoresPorFinca: ${error.message}`)
  return data.map(mapTrabajador)
}

export async function crearTrabajador(input: CrearTrabajadorInput, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client
    .from('trabajadores')
    .insert({
      finca_id: input.fincaId,
      nombre_completo: input.nombreCompleto.trim(),
      foto_url: input.fotoUrl.trim() || null,
      activo: input.activo,
    })
    .select(TRABAJADORES_COLUMNS)
    .single()

  if (error) throw new Error(`crearTrabajador: ${error.message}`)
  return mapTrabajador(data)
}

export async function actualizarTrabajador(input: ActualizarTrabajadorInput, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client
    .from('trabajadores')
    .update({ nombre_completo: input.nombreCompleto.trim(), foto_url: input.fotoUrl.trim() || null, activo: input.activo })
    .eq('id', input.id)
    .select(TRABAJADORES_COLUMNS)
    .single()

  if (error) throw new Error(`actualizarTrabajador: ${error.message}`)
  return mapTrabajador(data)
}

export async function cambiarEstadoTrabajador(trabajador: Trabajador, client: SupabaseClient = supabase): Promise<Trabajador> {
  const { data, error } = await client.from('trabajadores').update({ activo: !trabajador.activo }).eq('id', trabajador.id).select(TRABAJADORES_COLUMNS).single()

  if (error) throw new Error(`cambiarEstadoTrabajador: ${error.message}`)
  return mapTrabajador(data)
}

function mapTrabajador(row: { id: string; finca_id: string; nombre_completo: string; foto_url: string | null; activo: boolean }): Trabajador {
  return {
    id: row.id,
    fincaId: row.finca_id,
    nombreCompleto: row.nombre_completo,
    fotoUrl: row.foto_url,
    activo: row.activo,
  }
}
