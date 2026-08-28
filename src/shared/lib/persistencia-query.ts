import { get, set, del } from 'idb-keyval'
import type { DehydratedState } from '@tanstack/react-query'

const CLAVE_CACHE = 'query-cache'
const VIGENCIA_MS = 7 * 24 * 60 * 60 * 1000

// Subir a mano cuando cambie la forma de lo que se guarda: lo persistido por una version
// anterior se descarta en vez de rehidratarse contra tipos que ya no son esos.
const VERSION_CACHE = '1'

interface CachePersistida {
  version: string
  guardadoEn: number
  estado: DehydratedState
}

export function guardarCacheQuery(estado: DehydratedState): Promise<void> {
  const persistida: CachePersistida = { version: VERSION_CACHE, guardadoEn: Date.now(), estado }
  return set(CLAVE_CACHE, persistida)
}

export async function restaurarCacheQuery(): Promise<DehydratedState | null> {
  const guardada = await get<CachePersistida>(CLAVE_CACHE)

  if (guardada === undefined || guardada.version !== VERSION_CACHE) return null
  if (Date.now() - guardada.guardadoEn > VIGENCIA_MS) return null
  return guardada.estado
}

// Al cerrar sesion: lo persistido incluye nombres y datos de trabajadores, y el dispositivo
// de campo se comparte. Una mutacion pendiente que sobreviviera al logout tampoco serviria,
// la RLS la rechazaria sin sesion.
export function limpiarCacheQuery(): Promise<void> {
  return del(CLAVE_CACHE)
}
