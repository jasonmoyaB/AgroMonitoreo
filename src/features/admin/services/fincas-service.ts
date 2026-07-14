import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Finca } from '../../../shared/types/domain.types'
import type { CrearFincaInput } from '../types/finca-form.types'

const FINCAS_COLUMNS = 'id, nombre, activa'

export async function listarFincas(client: SupabaseClient = supabase): Promise<Finca[]> {
  const { data, error } = await client.from('fincas').select(FINCAS_COLUMNS).order('nombre', { ascending: true })

  if (error) throw new Error(`listarFincas: ${error.message}`)
  return data
}

export async function crearFinca(input: CrearFincaInput, client: SupabaseClient = supabase): Promise<Finca> {
  const { data, error } = await client
    .from('fincas')
    .insert({ id: input.id.trim(), nombre: input.nombre.trim() })
    .select(FINCAS_COLUMNS)
    .single()

  if (error) throw new Error(`crearFinca: ${error.message}`)
  if (!data) throw new Error('crearFinca: no se pudo crear la finca')
  return data
}

export async function cambiarEstadoFinca(finca: Finca, client: SupabaseClient = supabase): Promise<Finca> {
  const { data, error } = await client.from('fincas').update({ activa: !finca.activa }).eq('id', finca.id).select(FINCAS_COLUMNS).single()

  if (error) throw new Error(`cambiarEstadoFinca: ${error.message}`)
  return data
}
