import { supabase } from '../../../shared/lib/supabase-client'
import { MENSAJE_PASSWORD_FILTRADA } from '../constants/password.constants'
import { esPasswordFiltrada } from './pwned-passwords-service'
import { traducirErrorAuth } from '../utils/traducir-error-auth'
import type { AuthCredentials } from '../types/auth.types'

export async function iniciarSesion({ email, password }: AuthCredentials) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw new Error(traducirErrorAuth(error.message))
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(`cerrarSesion: ${error.message}`)
}

// La guarda vive aca y no en los hooks porque este es el unico lugar del repo que llama a
// `updateUser({ password })`: lo cubre tanto /reset-password (y la invitacion) como el
// cambio de contrasena del perfil. El mensaje va pelado, sin el prefijo `nombreFuncion:` de
// la convencion de errores, porque lo ve el usuario — mismo criterio que `iniciarSesion`.
export async function actualizarPassword(password: string) {
  if (await esPasswordFiltrada(password)) throw new Error(MENSAJE_PASSWORD_FILTRADA)

  const { error } = await supabase.auth.updateUser({ password })

  if (error) throw new Error(`actualizarPassword: ${error.message}`)
}

export async function solicitarRecuperacionPassword({ email }: { email: string }) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
  })

  if (error) throw new Error(`solicitarRecuperacionPassword: ${error.message}`)
}
