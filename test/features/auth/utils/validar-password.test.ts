import { describe, expect, it } from 'vitest'
import { validarPassword } from '../../../../src/features/auth/utils/validar-password'

describe('validarPassword', () => {
  it('rechaza contraseñas cortas', () => {
    expect(validarPassword('Abc1234')).toMatch(/8 caracteres/)
  })

  it('rechaza sin mayúscula', () => {
    expect(validarPassword('abcd1234')).toMatch(/mayúscula/)
  })

  it('rechaza sin minúscula', () => {
    expect(validarPassword('ABCD1234')).toMatch(/minúscula/)
  })

  it('rechaza sin número', () => {
    expect(validarPassword('Abcdefgh')).toMatch(/número/)
  })

  it('acepta contraseña que cumple todo', () => {
    expect(validarPassword('Abcd1234')).toBeNull()
  })
})
