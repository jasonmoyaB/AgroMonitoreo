export const TIPOS_MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'] as const
export type TipoMimePermitido = (typeof TIPOS_MIME_PERMITIDOS)[number]

export const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024

export const EXTENSION_POR_MIME: Record<TipoMimePermitido, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const FIRMA_BINARIA_POR_MIME: Record<TipoMimePermitido, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

export const BUCKET_FOTOS_TRABAJADORES = 'trabajador-fotos'

// El bucket es privado, asi que la foto se sirve por URL firmada. La vigencia iguala a la
// del cache persistido en IndexedDB (7 dias, persistencia-query.ts): si la firma venciera
// antes, la grilla de captura rehidratada sin señal pintaria avatares rotos justo cuando el
// cache la estaba salvando.
export const VIGENCIA_FIRMA_SEGUNDOS = 7 * 24 * 60 * 60
