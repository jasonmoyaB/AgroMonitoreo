import { afterEach, describe, expect, it, vi } from 'vitest'

// El modulo valida al cargarse, asi que cada caso necesita su propio import fresco.
async function cargarConstantes() {
  vi.resetModules()

  return import('../../../src/shared/constants/hacienda.constants')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('HACIENDA_CONTRIBUYENTE_URL', () => {
  // el bug que reporto la revision del PR: sin default, faltar la env en Vercel no
  // rompia el build (Vite hornea undefined) y la consulta salia a
  // `undefined?identificacion=...`, una ruta RELATIVA. Contra el rewrite SPA de
  // vercel.json el propio dominio devuelve index.html con 200, asi que respuesta.ok era
  // true, el .json() reventaba con SyntaxError, y la cedula quedaba en el access log.
  it('cae al registro publico de Hacienda cuando la env no esta cargada', async () => {
    vi.stubEnv('VITE_HACIENDA_CONTRIBUYENTE_URL', '')

    const { HACIENDA_CONTRIBUYENTE_URL } = await cargarConstantes()

    expect(HACIENDA_CONTRIBUYENTE_URL).toBe('https://api.hacienda.go.cr/fe/ae')
  })

  it('respeta el override cuando si esta cargada', async () => {
    vi.stubEnv('VITE_HACIENDA_CONTRIBUYENTE_URL', 'https://ejemplo.test/fe/ae')

    const { HACIENDA_CONTRIBUYENTE_URL } = await cargarConstantes()

    expect(HACIENDA_CONTRIBUYENTE_URL).toBe('https://ejemplo.test/fe/ae')
  })

  // falla al cargar el modulo, no en la primera consulta: la cedula viaja en el query
  // string, asi que un override en http seria mandarla en claro
  it('rechaza un override que no sea https, al cargar el modulo', async () => {
    vi.stubEnv('VITE_HACIENDA_CONTRIBUYENTE_URL', 'http://api.hacienda.go.cr/fe/ae')

    await expect(cargarConstantes()).rejects.toThrow('debe ser una URL https')
  })

  it('rechaza un override que no sea una URL absoluta', async () => {
    vi.stubEnv('VITE_HACIENDA_CONTRIBUYENTE_URL', '/api/hacienda')

    await expect(cargarConstantes()).rejects.toThrow('debe ser una URL https')
  })
})
