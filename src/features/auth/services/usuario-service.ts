import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RolNombre, Usuario } from '../../../shared/types/domain.types'

const USUARIO_COLUMNS = 'id, email, finca_id, activo, rol:roles(nombre), finca:fincas(nombre)'

interface UsuarioRow {
  id: string
  email: string
  finca_id: string
  activo: boolean
  rol: { nombre: RolNombre } | null
  finca: { nombre: string } | null
}

export async function obtenerUsuarioActual(client: SupabaseClient = supabase): Promise<Usuario> {
  const {
    data: { user: authUser },
  } = await client.auth.getUser()

  if (!authUser) throw new Error('obtenerUsuarioActual: no hay sesión activa')

  const { data, error } = await client
    .from('usuario')
    .select(USUARIO_COLUMNS)
    .eq('auth_user_id', authUser.id)
    .single<UsuarioRow>()

  if (error) throw new Error(`obtenerUsuarioActual: ${error.message}`)
  if (!data.rol) throw new Error('obtenerUsuarioActual: usuario sin rol asignado')

  return {
    id: data.id,
    email: data.email,
    fincaId: data.finca_id,
    fincaNombre: data.finca?.nombre ?? data.finca_id,
    activo: data.activo,
    rol: data.rol.nombre,
  }
}
