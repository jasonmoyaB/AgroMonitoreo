import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabase-client'
import { BUCKET_FOTOS_TRABAJADORES, EXTENSION_POR_MIME, type TipoMimePermitido } from '../constants/foto-trabajador.constants'

// La ruta arranca con la finca porque las policies del bucket scopean por
// storage.foldername(name)[1]: sin ese primer segmento el upload lo rechaza RLS.
export async function subirFotoTrabajador(input: { fincaId: string; archivo: File }, client: SupabaseClient = supabase): Promise<string> {
  const extension = EXTENSION_POR_MIME[input.archivo.type as TipoMimePermitido]
  const ruta = `${input.fincaId}/${crypto.randomUUID()}.${extension}`

  const { error } = await client.storage.from(BUCKET_FOTOS_TRABAJADORES).upload(ruta, input.archivo, {
    contentType: input.archivo.type,
    cacheControl: '3600',
  })
  if (error) throw new Error(`subirFotoTrabajador: ${error.message}`)

  return client.storage.from(BUCKET_FOTOS_TRABAJADORES).getPublicUrl(ruta).data.publicUrl
}
