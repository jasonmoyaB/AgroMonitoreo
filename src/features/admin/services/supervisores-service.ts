import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { RolNombre } from '../../../shared/types/domain.types'
import type { ActualizarSupervisorInput, Supervisor } from '../types/supervisor.types'

const SUPERVISORES_COLUMNS = 'id, email, nombre, activo, finca_id, finca:fincas(nombre), rol:roles!inner(nombre)'

interface SupervisorRow {
  id: string
  email: string
  nombre: string | null
  activo: boolean
  finca_id: string
  finca: { nombre: string } | null
  rol: { nombre: RolNombre } | null
}

export async function listarSupervisores(client: SupabaseClient = supabase): Promise<Supervisor[]> {
  const { data, error } = await client
    .from('usuario')
    .select(SUPERVISORES_COLUMNS)
    .eq('rol.nombre', 'supervisor')
    .order('email', { ascending: true })
    .returns<SupervisorRow[]>()

  if (error) throw new Error(`listarSupervisores: ${error.message}`)
  return data.map(mapSupervisor)
}

export async function actualizarSupervisor(input: ActualizarSupervisorInput, client: SupabaseClient = supabase): Promise<Supervisor> {
  const { data: rol, error: rolError } = await client.from('roles').select('id').eq('nombre', input.rol).single()
  if (rolError) throw new Error(`actualizarSupervisor: ${rolError.message}`)

  const { data, error } = await client
    .from('usuario')
    .update({ nombre: input.nombre.trim() || null, rol_id: rol.id, finca_id: input.fincaId })
    .eq('id', input.id)
    .select(SUPERVISORES_COLUMNS)
    .single<SupervisorRow>()

  if (error) throw new Error(`actualizarSupervisor: ${error.message}`)
  return mapSupervisor(data)
}

export async function cambiarEstadoSupervisor(supervisor: Supervisor, client: SupabaseClient = supabase): Promise<Supervisor> {
  const { data, error } = await client
    .from('usuario')
    .update({ activo: !supervisor.activo })
    .eq('id', supervisor.id)
    .select(SUPERVISORES_COLUMNS)
    .single<SupervisorRow>()

  if (error) throw new Error(`cambiarEstadoSupervisor: ${error.message}`)
  if (!data) throw new Error('cambiarEstadoSupervisor: usuario no encontrado')
  return mapSupervisor(data)
}

function mapSupervisor(row: SupervisorRow): Supervisor {
  if (!row.rol) throw new Error('mapSupervisor: usuario sin rol asignado')

  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    fincaId: row.finca_id,
    fincaNombre: row.finca?.nombre ?? row.finca_id,
    activo: row.activo,
    rol: row.rol.nombre,
  }
}
