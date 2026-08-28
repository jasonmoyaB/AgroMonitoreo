import { describe, expect, it } from 'vitest'
import { esPasswordFiltrada } from '../../../../src/features/auth/services/pwned-passwords-service'

// Rango de "password": SHA-1 5BAA6 + 1E4C9B93F3F0682250B6CF8331B7EE68FD8
const RANGO_CON_PASSWORD = '1E4C9B93F3F0682250B6CF8331B7EE68FD8:10382543\r\n0018A45C4D1DEF81644B54AB7F969B88D65:1'
const RANGO_SIN_PASSWORD = '0018A45C4D1DEF81644B54AB7F969B88D65:1'

function fetchQueResponde(cuerpo: string, ok = true, status = 200): typeof fetch {
  return (async () => new Response(cuerpo, { status, statusText: ok ? 'OK' : 'Error' })) as unknown as typeof fetch
}

describe('esPasswordFiltrada', () => {
  it('es true cuando el sufijo aparece en el rango', async () => {
    expect(await esPasswordFiltrada('password', { fetchImpl: fetchQueResponde(RANGO_CON_PASSWORD) })).toBe(true)
  })

  it('es false cuando el sufijo no aparece en el rango', async () => {
    expect(await esPasswordFiltrada('password', { fetchImpl: fetchQueResponde(RANGO_SIN_PASSWORD) })).toBe(false)
  })

  it('consulta solo el prefijo del hash, nunca la contrasena', async () => {
    const urlsPedidas: string[] = []
    const fetchEspia = (async (url: string) => {
      urlsPedidas.push(String(url))
      return new Response(RANGO_SIN_PASSWORD)
    }) as unknown as typeof fetch

    await esPasswordFiltrada('password', { fetchImpl: fetchEspia })

    expect(urlsPedidas).toEqual(['https://api.pwnedpasswords.com/range/5BAA6'])
  })

  it('falla abierto cuando la API responde con error', async () => {
    expect(await esPasswordFiltrada('password', { fetchImpl: fetchQueResponde('', false, 500) })).toBe(false)
  })

  it('falla abierto cuando no hay red', async () => {
    const fetchQueRevienta = (async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch

    expect(await esPasswordFiltrada('password', { fetchImpl: fetchQueRevienta })).toBe(false)
  })

  it('falla abierto cuando el llamador aborta', async () => {
    const abortada = AbortSignal.abort()
    const fetchQueRespetaAbort = (async (_url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      return new Response(RANGO_CON_PASSWORD)
    }) as unknown as typeof fetch

    expect(await esPasswordFiltrada('password', { fetchImpl: fetchQueRespetaAbort, signal: abortada })).toBe(false)
  })
})
