import { PWNED_PASSWORDS_URL, PWNED_TIMEOUT_MS } from '../constants/password.constants'
import { contarAparicionesPwned } from '../utils/contar-apariciones-pwned'
import { hashearPasswordSha1 } from '../utils/hashear-password-sha1'

interface OpcionesConsulta {
  /** Se inyecta por el mismo motivo que los services de Supabase reciben el client. */
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

const SIN_APARICIONES = 0

function acotarEspera(signal?: AbortSignal): AbortSignal {
  const porTiempo = AbortSignal.timeout(PWNED_TIMEOUT_MS)
  return signal ? AbortSignal.any([signal, porTiempo]) : porTiempo
}

/**
 * Consulta HaveIBeenPwned por k-anonymity: sale el prefijo del SHA-1, nunca la contrasena.
 *
 * **Falla abierto a proposito.** Que la API este caida, que no haya red o que `crypto.subtle`
 * no exista (contexto inseguro) no puede dejar a un invitado sin poder definir su contrasena:
 * ante cualquier problema devuelve false y el flujo sigue con la validacion sincronica.
 *
 * ponytail: se omite el header `Add-Padding: true` — dispara un preflight CORS y solo evita
 * que un observador de red infiera el bucket por el tamano de la respuesta. Agregarlo si
 * alguna vez importa ese nivel de privacidad de red.
 */
export async function esPasswordFiltrada(password: string, opciones: OpcionesConsulta = {}): Promise<boolean> {
  const { fetchImpl = fetch, signal } = opciones

  try {
    const { prefijo, sufijo } = await hashearPasswordSha1(password)
    const respuesta = await fetchImpl(`${PWNED_PASSWORDS_URL}/${prefijo}`, { signal: acotarEspera(signal) })

    if (!respuesta.ok) return false

    return contarAparicionesPwned(await respuesta.text(), sufijo) > SIN_APARICIONES
  } catch {
    return false
  }
}
