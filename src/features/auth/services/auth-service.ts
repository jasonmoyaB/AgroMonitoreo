import { supabase } from '../../../shared/lib/supabase-client'
import type { AuthCredentials } from '../types/auth.types'

export async function iniciarSesion({ email, password }: AuthCredentials) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(`iniciarSesion: ${error.message}`)
}

export async function registrarSupervisor({ email, password }: AuthCredentials): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) throw new Error(`registrarSupervisor: ${error.message}`)
  return data.session !== null
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(`cerrarSesion: ${error.message}`)
}
