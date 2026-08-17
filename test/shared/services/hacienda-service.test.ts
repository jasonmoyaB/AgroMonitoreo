import { describe, expect, it, vi } from 'vitest'
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
    const contribuyente = await consultarContribuyente('4000042139', fetchFalso(200, RESPUESTA_ICE))

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
    const contribuyente = await consultarContribuyente('4000042139', fetchFalso(200, body))

    expect(contribuyente?.moroso).toBe(false)
    expect(contribuyente?.omiso).toBe(true)
  })

  it('devuelve null en 404: no estar inscrito no es un error', async () => {
    const noEncontrado = { code: 404, status: 'Information no available on this system' }
    await expect(consultarContribuyente('999999999', fetchFalso(404, noEncontrado))).resolves.toBeNull()
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

    await expect(consultarContribuyente('123', fetchHtml)).rejects.toThrow('Hacienda respondió 400')
  })

  it('lanza cuando Hacienda esta caida', async () => {
    await expect(consultarContribuyente('4000042139', fetchFalso(503))).rejects.toThrow('Hacienda respondió 503')
  })

  it('tolera una respuesta sin situacion ni regimen', async () => {
    const contribuyente = await consultarContribuyente('4000042139', fetchFalso(200, { nombre: 'JUAN' }))

    expect(contribuyente).toEqual({ nombre: 'JUAN', regimen: '', estado: '', moroso: false, omiso: false })
  })

  it('manda la cedula ya escapada en el query string', async () => {
    const espia = fetchFalso(200, RESPUESTA_ICE)
    await consultarContribuyente('4000042139', espia)

    expect(espia).toHaveBeenCalledWith('https://api.hacienda.go.cr/fe/ae?identificacion=4000042139')
  })
})
