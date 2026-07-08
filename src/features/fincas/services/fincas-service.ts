import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { Finca } from '../../../shared/types/domain.types'

const FINCAS_COLUMNS = 'id, nombre, activa'

export async function listarFincas(client: SupabaseClient = supabase): Promise<Finca[]> {
  const { data, error } = await client.from('fincas').select(FINCAS_COLUMNS).order('nombre', { ascending: true })

  if (error) throw new Error(`listarFincas: ${error.message}`)
  return data
}
