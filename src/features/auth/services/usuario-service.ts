import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RolNombre, Usuario } from '../../../shared/types/domain.types'

const USUARIO_COLUMNS = 'id, email, finca_id, activo, rol:roles(nombre)'

interface UsuarioRow {
  id: string
  email: string
  finca_id: string
  activo: boolean
  rol: { nombre: RolNombre } | null
}

export async function obtenerUsuarioActual(client: SupabaseClient = supabase): Promise<Usuario> {
  const { data, error } = await client.from('usuario').select(USUARIO_COLUMNS).single<UsuarioRow>()

  if (error) throw new Error(`obtenerUsuarioActual: ${error.message}`)
  if (!data.rol) throw new Error('obtenerUsuarioActual: usuario sin rol asignado')

  return {
    id: data.id,
    email: data.email,
    fincaId: data.finca_id,
    activo: data.activo,
    rol: data.rol.nombre,
  }
}
