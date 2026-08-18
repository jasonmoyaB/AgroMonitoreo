import { HACIENDA_CONTRIBUYENTE_URL, HACIENDA_FLAG_SI, HACIENDA_NO_ENCONTRADO, HACIENDA_TIMEOUT_MS } from '../constants/hacienda.constants'
import type { ContribuyenteHacienda } from '../types/hacienda.types'

interface OpcionesConsulta {
  /** Se inyecta por el mismo motivo que los services de Supabase reciben el client. */
  fetchImpl?: typeof fetch
  /** El que manda TanStack Query: corta la consulta si el campo se desmonta. */
  signal?: AbortSignal
}

/** El body es de un tercero: se navega con narrowing, nunca con un cast. */
function leerCampo(objeto: unknown, nombre: string): unknown {
  return objeto && typeof objeto === 'object' ? (objeto as Record<string, unknown>)[nombre] : undefined
}

function leerTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function acotarEspera(signal?: AbortSignal): AbortSignal {
  const porTiempo = AbortSignal.timeout(HACIENDA_TIMEOUT_MS)

  return signal ? AbortSignal.any([signal, porTiempo]) : porTiempo
}

/**
 * Consulta el registro de contribuyentes de Hacienda. Es una API publica, sin llave, y
 * manda `Access-Control-Allow-Origin: *`, asi que se llama derecho desde el navegador
 * sin necesidad de una edge function de proxy.
 *
 * Devuelve null cuando la cedula no esta inscrita como contribuyente. Eso NO es un
 * error: un asalariado normal puede no estar en el registro, y el formulario tiene que
 * dejarlo guardar igual.
 */
export async function consultarContribuyente(cedula: string, opciones: OpcionesConsulta = {}): Promise<ContribuyenteHacienda | null> {
  const { fetchImpl = fetch, signal } = opciones
  const url = `${HACIENDA_CONTRIBUYENTE_URL}?identificacion=${encodeURIComponent(cedula)}`
  const respuesta = await fetchImpl(url, { signal: acotarEspera(signal) })

  if (respuesta.status === HACIENDA_NO_ENCONTRADO) return null

  // se ramifica por status y no parseando el body a proposito: un 400 de esta API
  // llega como HTML, no como JSON, asi que un .json() aca reventaria con un
  // SyntaxError que no dice nada del problema real.
  if (!respuesta.ok) throw new Error(`consultarContribuyente: Hacienda respondió ${respuesta.status}`)

  const datos: unknown = await respuesta.json()
  const situacion = leerCampo(datos, 'situacion')

  return {
    nombre: leerTexto(leerCampo(datos, 'nombre')),
    regimen: leerTexto(leerCampo(leerCampo(datos, 'regimen'), 'descripcion')),
    estado: leerTexto(leerCampo(situacion, 'estado')),
    moroso: leerTexto(leerCampo(situacion, 'moroso')) === HACIENDA_FLAG_SI,
    omiso: leerTexto(leerCampo(situacion, 'omiso')) === HACIENDA_FLAG_SI,
  }
}
