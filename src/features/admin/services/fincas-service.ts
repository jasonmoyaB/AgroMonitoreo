import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Finca } from '../../../shared/types/domain.types'
import type { ActualizarFincaInput, ActualizarValorHoraInput, CrearFincaInput } from '../types/finca-form.types'

const FINCAS_COLUMNS = 'id, nombre, activa, valor_hora, valor_hora_usd'

export async function listarFincas(client: SupabaseClient = supabase): Promise<Finca[]> {
  const { data, error } = await client.from('fincas').select(FINCAS_COLUMNS).order('nombre', { ascending: true })

  if (error) throw new Error(`listarFincas: ${error.message}`)
  return data.map(mapFinca)
}

export async function crearFinca(input: CrearFincaInput, client: SupabaseClient = supabase): Promise<Finca> {
  const { data, error } = await client
    .from('fincas')
    .insert({ id: input.id.trim(), nombre: input.nombre.trim() })
    .select(FINCAS_COLUMNS)
    .single()

  if (error) throw new Error(`crearFinca: ${error.message}`)
  if (!data) throw new Error('crearFinca: no se pudo crear la finca')
  return mapFinca(data)
}

export async function actualizarFinca(input: ActualizarFincaInput, client: SupabaseClient = supabase): Promise<Finca> {
  const { data, error } = await client
    .from('fincas')
    .update({ nombre: input.nombre.trim() })
    .eq('id', input.id)
    .select(FINCAS_COLUMNS)
    .single()

  if (error) throw new Error(`actualizarFinca: ${error.message}`)
  if (!data) throw new Error('actualizarFinca: finca no encontrada')
  return mapFinca(data)
}

export async function cambiarEstadoFinca(finca: Finca, client: SupabaseClient = supabase): Promise<Finca> {
  const { data, error } = await client.from('fincas').update({ activa: !finca.activa }).eq('id', finca.id).select(FINCAS_COLUMNS).single()

  if (error) throw new Error(`cambiarEstadoFinca: ${error.message}`)
  if (!data) throw new Error('cambiarEstadoFinca: finca no encontrada')
  return mapFinca(data)
}

// cada input manda solo su moneda: un update con los dos campos pisaria el otro con el
// valor que las props tenian al montar, que puede estar viejo
export async function actualizarValorHoraFinca(input: ActualizarValorHoraInput, client: SupabaseClient = supabase): Promise<Finca> {
  const cambio = input.moneda === 'usd' ? { valor_hora_usd: input.valorHora } : { valor_hora: input.valorHora }
  const { data, error } = await client.from('fincas').update(cambio).eq('id', input.id).select(FINCAS_COLUMNS).single()

  if (error) throw new Error(`actualizarValorHoraFinca: ${error.message}`)
  if (!data) throw new Error('actualizarValorHoraFinca: finca no encontrada')
  return mapFinca(data)
}

function mapFinca(row: { id: string; nombre: string; activa: boolean; valor_hora: number; valor_hora_usd: number }): Finca {
  return { id: row.id, nombre: row.nombre, activa: row.activa, valorHora: row.valor_hora, valorHoraUsd: row.valor_hora_usd }
}
