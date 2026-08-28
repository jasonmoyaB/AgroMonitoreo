import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DehydratedState } from '@tanstack/react-query'

const { store } = vi.hoisted(() => ({ store: new Map<string, unknown>() }))

vi.mock('idb-keyval', () => ({
  get: (clave: string) => Promise.resolve(store.get(clave)),
  set: (clave: string, valor: unknown) => {
    store.set(clave, valor)
    return Promise.resolve()
  },
  del: (clave: string) => {
    store.delete(clave)
    return Promise.resolve()
  },
}))

const { guardarCacheQuery, limpiarCacheQuery, restaurarCacheQuery } = await import(
  '../../../src/shared/lib/persistencia-query'
)

const CLAVE_CACHE = 'query-cache'
const DIA_MS = 24 * 60 * 60 * 1000
const ESTADO: DehydratedState = { mutations: [], queries: [] }

// La forma persistida es contrato de este modulo: los tests de version y vencimiento tienen
// que poder escribirla a mano, porque no hay API publica para producir una version vieja.
function guardarCrudo(version: string, guardadoEn: number) {
  store.set(CLAVE_CACHE, { version, guardadoEn, estado: ESTADO })
}

describe('persistencia del cache de queries', () => {
  beforeEach(() => {
    store.clear()
  })

  it('sin nada guardado devuelve null en vez de romper', async () => {
    expect(await restaurarCacheQuery()).toBeNull()
  })

  it('devuelve lo que acaba de guardar', async () => {
    await guardarCacheQuery(ESTADO)

    expect(await restaurarCacheQuery()).toEqual(ESTADO)
  })

  it('descarta lo guardado por una version anterior de la app', async () => {
    guardarCrudo('version-vieja', Date.now())

    expect(await restaurarCacheQuery()).toBeNull()
  })

  it('descarta lo guardado hace mas de la vigencia', async () => {
    guardarCrudo('1', Date.now() - 8 * DIA_MS)

    expect(await restaurarCacheQuery()).toBeNull()
  })

  it('lo guardado dentro de la vigencia sigue sirviendo', async () => {
    guardarCrudo('1', Date.now() - 6 * DIA_MS)

    expect(await restaurarCacheQuery()).toEqual(ESTADO)
  })

  it('limpiar deja la restauracion en null', async () => {
    await guardarCacheQuery(ESTADO)
    await limpiarCacheQuery()

    expect(await restaurarCacheQuery()).toBeNull()
  })
})
