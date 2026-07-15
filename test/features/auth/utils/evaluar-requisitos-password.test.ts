import { describe, expect, it } from 'vitest'
import { evaluarRequisitosPassword } from '../../../../src/features/auth/utils/evaluar-requisitos-password'

describe('evaluarRequisitosPassword', () => {
  it('marca todo incumplido con password vacío', () => {
    expect(evaluarRequisitosPassword('')).toEqual([
      { texto: 'Mínimo 8 caracteres', cumplido: false },
      { texto: 'Una mayúscula', cumplido: false },
      { texto: 'Una minúscula', cumplido: false },
      { texto: 'Un número', cumplido: false },
    ])
  })

  it('marca cada requisito por separado a medida que se cumple', () => {
    expect(evaluarRequisitosPassword('abcdefgh')).toEqual([
      { texto: 'Mínimo 8 caracteres', cumplido: true },
      { texto: 'Una mayúscula', cumplido: false },
      { texto: 'Una minúscula', cumplido: true },
      { texto: 'Un número', cumplido: false },
    ])
  })

  it('marca todo cumplido cuando la password es fuerte', () => {
    expect(evaluarRequisitosPassword('Abcd1234').every((r) => r.cumplido)).toBe(true)
  })
})
