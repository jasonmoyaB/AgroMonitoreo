import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import type { DatosPersonalesUsuario } from '../types/perfil.types'

const DATOS_PERSONALES_COLUMNS = 'telefono, email_contacto, cedula, fecha_nacimiento, direccion, contacto_emergencia'

interface DatosPersonalesRow {
  telefono: string | null
  email_contacto: string | null
  cedula: string | null
  fecha_nacimiento: string | null
  direccion: string | null
  contacto_emergencia: string | null
}

/** '' desde el form significa "sin dato": la base guarda null, no un string vacio. */
function aNullSiVacio(valor: string): string | null {
  return valor.trim() || null
}

export async function obtenerDatosPersonales(usuarioId: string, client: SupabaseClient = supabase): Promise<DatosPersonalesUsuario> {
  const { data, error } = await client.from('usuario').select(DATOS_PERSONALES_COLUMNS).eq('id', usuarioId).single<DatosPersonalesRow>()

  if (error) throw new Error(`obtenerDatosPersonales: ${error.message}`)

  return {
    telefono: data.telefono ?? '',
    emailContacto: data.email_contacto ?? '',
    cedula: data.cedula ?? '',
    fechaNacimiento: data.fecha_nacimiento ?? '',
    direccion: data.direccion ?? '',
    contactoEmergencia: data.contacto_emergencia ?? '',
  }
}

export async function actualizarDatosPersonales(usuarioId: string, datos: DatosPersonalesUsuario, client: SupabaseClient = supabase): Promise<void> {
  // solo estas seis columnas: rol_id, finca_id, activo y email los rechaza el
  // trigger evitar_escalada_privilegios_usuario, y nombre tiene su propio form.
  const { error } = await client
    .from('usuario')
    .update({
      telefono: aNullSiVacio(datos.telefono),
      email_contacto: aNullSiVacio(datos.emailContacto),
      cedula: aNullSiVacio(datos.cedula),
      fecha_nacimiento: aNullSiVacio(datos.fechaNacimiento),
      direccion: aNullSiVacio(datos.direccion),
      contacto_emergencia: aNullSiVacio(datos.contactoEmergencia),
    })
    .eq('id', usuarioId)

  if (error) throw new Error(`actualizarDatosPersonales: ${error.message}`)
}
