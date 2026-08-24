import { describe, expect, it } from 'vitest'
import { hashearPasswordSha1 } from '../../../../src/features/auth/utils/hashear-password-sha1'

describe('hashearPasswordSha1', () => {
  it('parte el SHA-1 en mayusculas: 5 caracteres de prefijo y el resto de sufijo', async () => {
    // SHA-1 de "password" = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    expect(await hashearPasswordSha1('password')).toEqual({
      prefijo: '5BAA6',
      sufijo: '1E4C9B93F3F0682250B6CF8331B7EE68FD8',
    })
  })

  it('el hash completo mide 40 caracteres hex', async () => {
    const { prefijo, sufijo } = await hashearPasswordSha1('Contrasena-de-prueba-1')

    expect(`${prefijo}${sufijo}`).toMatch(/^[0-9A-F]{40}$/)
  })
})
