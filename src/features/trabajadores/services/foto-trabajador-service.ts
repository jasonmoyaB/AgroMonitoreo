import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import {
  BUCKET_FOTOS_TRABAJADORES,
  EXTENSION_POR_MIME,
  VIGENCIA_FIRMA_SEGUNDOS,
  type TipoMimePermitido,
} from '../constants/foto-trabajador.constants'
import { rutaDesdeFotoUrl } from '../utils/ruta-foto-trabajador'

// La ruta arranca con la finca porque las policies del bucket scopean por
// storage.foldername(name)[1]: sin ese primer segmento el upload lo rechaza RLS.
//
// Devuelve la RUTA, no una URL: el bucket es privado desde 20260828174853 y lo que se
// guarda en trabajadores.foto_url tiene que sobrevivir al vencimiento de cualquier firma.
export async function subirFotoTrabajador(input: { fincaId: string; archivo: File }, client: SupabaseClient = supabase): Promise<string> {
  const extension = EXTENSION_POR_MIME[input.archivo.type as TipoMimePermitido]
  const ruta = `${input.fincaId}/${crypto.randomUUID()}.${extension}`

  const { error } = await client.storage.from(BUCKET_FOTOS_TRABAJADORES).upload(ruta, input.archivo, {
    contentType: input.archivo.type,
    cacheControl: '3600',
  })
  if (error) throw new Error(`subirFotoTrabajador: ${error.message}`)

  return ruta
}

// Cambia `fotoUrl` por una URL firmada, en lote y en una sola llamada.
//
// Va en el service y no en el componente por dos razones: `Avatar` no puede hacer fetching
// (es UI), y firmar de a una seria un request por fila de la tabla. Un fallo al firmar deja
// la foto en null en vez de romper la pantalla: sin cara se puede trabajar, sin lista no.
export async function firmarFotosTrabajadores<T extends { fotoUrl: string | null }>(
  filas: readonly T[],
  client: SupabaseClient = supabase,
): Promise<T[]> {
  const rutas = [...new Set(filas.map((fila) => rutaDesdeFotoUrl(fila.fotoUrl)).filter((ruta): ruta is string => ruta !== null))]
  if (rutas.length === 0) return filas.map((fila) => ({ ...fila, fotoUrl: null }))

  const { data, error } = await client.storage.from(BUCKET_FOTOS_TRABAJADORES).createSignedUrls(rutas, VIGENCIA_FIRMA_SEGUNDOS)
  if (error) return filas.map((fila) => ({ ...fila, fotoUrl: null }))

  // `path` viene tipado como nullable: una ruta que no existe en el bucket vuelve con su
  // propio `error` y sin firma.
  const firmadas = new Map<string, string>()
  for (const item of data) {
    if (item.path && item.signedUrl) firmadas.set(item.path, item.signedUrl)
  }

  return filas.map((fila) => {
    const ruta = rutaDesdeFotoUrl(fila.fotoUrl)
    return { ...fila, fotoUrl: ruta === null ? null : (firmadas.get(ruta) ?? null) }
  })
}
