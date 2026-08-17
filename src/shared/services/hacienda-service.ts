import { HACIENDA_CONTRIBUYENTE_URL, HACIENDA_NO_ENCONTRADO } from '../constants/hacienda.constants'
import type { ContribuyenteHacienda } from '../types/hacienda.types'

interface ContribuyenteRespuesta {
  nombre?: string
  regimen?: { descripcion?: string }
  situacion?: { estado?: string; moroso?: string; omiso?: string }
}

/** La API responde los flags como "SI"/"NO", no como booleanos. */
function esSi(valor: string | undefined): boolean {
  return valor === 'SI'
}

/**
 * Consulta el registro de contribuyentes de Hacienda. Es una API publica, sin
 * llave, y manda `Access-Control-Allow-Origin: *`, asi que se llama derecho desde
 * el navegador sin necesidad de una edge function de proxy.
 *
 * Devuelve null cuando la cedula no esta inscrita como contribuyente. Eso NO es un
 * error: un asalariado normal puede no estar en el registro, y el formulario tiene
 * que dejarlo guardar igual.
 *
 * fetchImpl se inyecta por el mismo motivo que los services de Supabase reciben el
 * client: para testear las tres ramas sin tocar la red.
 */
export async function consultarContribuyente(cedula: string, fetchImpl: typeof fetch = fetch): Promise<ContribuyenteHacienda | null> {
  const respuesta = await fetchImpl(`${HACIENDA_CONTRIBUYENTE_URL}?identificacion=${encodeURIComponent(cedula)}`)

  if (respuesta.status === HACIENDA_NO_ENCONTRADO) return null

  // se ramifica por status y no parseando el body a proposito: un 400 de esta API
  // llega como HTML, no como JSON, asi que un .json() aca reventaria con un
  // SyntaxError que no dice nada del problema real.
  if (!respuesta.ok) throw new Error(`consultarContribuyente: Hacienda respondió ${respuesta.status}`)

  const datos = (await respuesta.json()) as ContribuyenteRespuesta

  return {
    nombre: datos.nombre?.trim() ?? '',
    regimen: datos.regimen?.descripcion ?? '',
    estado: datos.situacion?.estado ?? '',
    moroso: esSi(datos.situacion?.moroso),
    omiso: esSi(datos.situacion?.omiso),
  }
}
