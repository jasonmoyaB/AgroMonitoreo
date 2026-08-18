import { describe, expect, it, vi } from 'vitest'
import { HACIENDA_CONTRIBUYENTE_URL } from '../../../src/shared/constants/hacienda.constants'
import { consultarContribuyente } from '../../../src/shared/services/hacienda-service'

// respuesta real de la API para 4000042139 (ICE), recortada a lo que se mapea
const RESPUESTA_ICE = {
  nombre: 'INSTITUTO COSTARRICENSE DE ELECTRICIDAD',
  tipoIdentificacion: '02',
  regimen: { codigo: 1, descripcion: 'Régimen general' },
  situacion: { moroso: 'SI', omiso: 'NO', estado: 'Inscrito' },
  actividades: [{ estado: 'A', tipo: 'P', codigo: '6110.0', descripcion: 'Telecomunicaciones' }],
}

function fetchFalso(status: number, body?: unknown): typeof fetch {
  return vi.fn(async () => ({ status, ok: status >= 200 && status < 300, json: async () => body })) as unknown as typeof fetch
}

describe('consultarContribuyente', () => {
  it('mapea la respuesta de Hacienda al dominio', async () => {
    const contribuyente = await consultarContribuyente('4000042139', { fetchImpl: fetchFalso(200, RESPUESTA_ICE) })

    expect(contribuyente).toEqual({
      nombre: 'INSTITUTO COSTARRICENSE DE ELECTRICIDAD',
      regimen: 'Régimen general',
      estado: 'Inscrito',
      moroso: true,
      omiso: false,
    })
  })

  it('convierte los flags "SI"/"NO" a booleanos', async () => {
    const body = { ...RESPUESTA_ICE, situacion: { moroso: 'NO', omiso: 'SI', estado: 'Inscrito' } }
    const contribuyente = await consultarContribuyente('4000042139', { fetchImpl: fetchFalso(200, body) })

    expect(contribuyente?.moroso).toBe(false)
    expect(contribuyente?.omiso).toBe(true)
  })

  it('devuelve null en 404: no estar inscrito no es un error', async () => {
    const noEncontrado = { code: 404, status: 'Information no available on this system' }
    await expect(consultarContribuyente('999999999', { fetchImpl: fetchFalso(404, noEncontrado) })).resolves.toBeNull()
  })

  // el 400 de esta API llega como HTML: si el service parseara el body para decidir,
  // explotaria con un SyntaxError en vez de con un mensaje util
  it('lanza en 400 sin tocar el body, que viene en HTML', async () => {
    const fetchHtml = vi.fn(async () => ({
      status: 400,
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON')
      },
    })) as unknown as typeof fetch

    await expect(consultarContribuyente('123', { fetchImpl: fetchHtml })).rejects.toThrow('Hacienda respondió 400')
  })

  it('lanza cuando Hacienda esta caida', async () => {
    await expect(consultarContribuyente('4000042139', { fetchImpl: fetchFalso(503) })).rejects.toThrow('Hacienda respondió 503')
  })

  it('tolera una respuesta sin situacion ni regimen', async () => {
    const contribuyente = await consultarContribuyente('4000042139', { fetchImpl: fetchFalso(200, { nombre: 'JUAN' }) })

    expect(contribuyente).toEqual({ nombre: 'JUAN', regimen: '', estado: '', moroso: false, omiso: false })
  })

  it('manda la cedula ya escapada en el query string', async () => {
    const espia = fetchFalso(200, RESPUESTA_ICE)
    await consultarContribuyente('4000042139', { fetchImpl: espia })

    // la URL sale de la constante y no de un literal: hardcodearla ataba el test al
    // .env.local, que no esta versionado — en un clon limpio fallaba por eso, no por el codigo
    expect(espia).toHaveBeenCalledWith(`${HACIENDA_CONTRIBUYENTE_URL}?identificacion=4000042139`, expect.anything())
  })

  // el body es de un tercero: si Hacienda cambia un campo de tipo, el mapeo no puede
  // reventar con "datos.nombre.trim is not a function" y quedar como un error de red
  it('tolera campos con el tipo equivocado sin romper el mapeo', async () => {
    const contribuyente = await consultarContribuyente('4000042139', { fetchImpl: fetchFalso(200, { nombre: 12345, situacion: 'inscrito' }) })

    expect(contribuyente).toEqual({ nombre: '', regimen: '', estado: '', moroso: false, omiso: false })
  })

  it('acota la espera: siempre manda un signal', async () => {
    const espia = fetchFalso(200, RESPUESTA_ICE)
    await consultarContribuyente('4000042139', { fetchImpl: espia })

    const opciones = vi.mocked(espia).mock.calls[0][1]
    expect(opciones?.signal).toBeInstanceOf(AbortSignal)
  })

  // sin esto la promesa queda pendiente para siempre: staleTime Infinity la deja
  // cacheada colgada y el capataz ve "Consultando Hacienda..." sin isError y sin salida
  it('corta la consulta cuando el campo se desmonta', async () => {
    const controlador = new AbortController()
    const fetchQueEscucha = vi.fn(
      (_url: string, opciones?: RequestInit) =>
        new Promise<Response>((_resolver, rechazar) => {
          opciones?.signal?.addEventListener('abort', () => rechazar(new Error('AbortError')))
        }),
    ) as unknown as typeof fetch

    const promesa = consultarContribuyente('4000042139', { fetchImpl: fetchQueEscucha, signal: controlador.signal })
    controlador.abort()

    await expect(promesa).rejects.toThrow('AbortError')
  })
})
