import { PWNED_PREFIJO_LARGO } from '../constants/password.constants'

interface HashPartido {
  prefijo: string
  sufijo: string
}

const HEX_POR_BYTE = 2

function aHexMayusculas(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(HEX_POR_BYTE, '0'))
    .join('')
    .toUpperCase()
}

/**
 * SHA-1 en mayusculas partido como lo exige el rango de HaveIBeenPwned: el prefijo es lo
 * unico que viaja por la red, el sufijo se compara localmente contra lo que devuelva la API.
 */
export async function hashearPasswordSha1(password: string): Promise<HashPartido> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password))
  const hash = aHexMayusculas(digest)

  return { prefijo: hash.slice(0, PWNED_PREFIJO_LARGO), sufijo: hash.slice(PWNED_PREFIJO_LARGO) }
}
