import { describe, expect, it } from 'vitest'
import { validarFotoTrabajador } from '../../../../src/features/trabajadores/utils/validar-foto-trabajador'

function archivo(bytes: number[], tipo: string, tamano = bytes.length): File {
  const buffer = new Uint8Array(tamano)
  buffer.set(bytes)
  return new File([buffer], 'foto', { type: tipo })
}

const JPEG_VALIDO = [0xff, 0xd8, 0xff, 0xe0]
const PNG_VALIDO = [0x89, 0x50, 0x4e, 0x47]
const WEBP_VALIDO = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]

describe('validarFotoTrabajador', () => {
  it('acepta un jpeg con firma binaria correcta', async () => {
    const resultado = await validarFotoTrabajador(archivo(JPEG_VALIDO, 'image/jpeg'))
    expect(resultado).toEqual({ valido: true, error: null })
  })

  it('acepta un png con firma binaria correcta', async () => {
    const resultado = await validarFotoTrabajador(archivo(PNG_VALIDO, 'image/png'))
    expect(resultado.valido).toBe(true)
  })

  it('acepta un webp solo si además del RIFF trae la marca WEBP', async () => {
    const resultado = await validarFotoTrabajador(archivo(WEBP_VALIDO, 'image/webp'))
    expect(resultado.valido).toBe(true)
  })

  it('rechaza un webp con RIFF pero sin marca WEBP', async () => {
    const riffSinWebp = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0, 0, 0, 0]
    const resultado = await validarFotoTrabajador(archivo(riffSinWebp, 'image/webp'))
    expect(resultado.valido).toBe(false)
  })

  it('rechaza un tipo MIME no permitido', async () => {
    const resultado = await validarFotoTrabajador(archivo(JPEG_VALIDO, 'application/pdf'))
    expect(resultado).toEqual({ valido: false, error: 'Solo se permiten fotos JPG, PNG o WEBP.' })
  })

  it('rechaza un archivo que dice ser jpeg pero no tiene la firma binaria (extensión falsa)', async () => {
    const resultado = await validarFotoTrabajador(archivo([0x00, 0x00, 0x00, 0x00], 'image/jpeg'))
    expect(resultado).toEqual({ valido: false, error: 'El archivo no es una imagen válida.' })
  })

  it('rechaza un archivo que supera el tamaño máximo', async () => {
    const resultado = await validarFotoTrabajador(archivo(JPEG_VALIDO, 'image/jpeg', 5 * 1024 * 1024 + 1))
    expect(resultado).toEqual({ valido: false, error: 'La foto pesa demasiado. Máximo 5 MB.' })
  })
})
