import { describe, expect, it } from 'vitest'
import { calcularCooldownMs } from '../../../../src/features/auth/utils/calcular-cooldown-ms'

describe('calcularCooldownMs', () => {
  it('no aplica cooldown antes del umbral de intentos', () => {
    expect(calcularCooldownMs(0)).toBe(0)
    expect(calcularCooldownMs(1)).toBe(0)
  })

  it('crece exponencialmente a partir del umbral', () => {
    expect(calcularCooldownMs(2)).toBe(2000)
    expect(calcularCooldownMs(3)).toBe(4000)
    expect(calcularCooldownMs(4)).toBe(8000)
    expect(calcularCooldownMs(5)).toBe(16000)
  })

  it('se limita al tope máximo aunque los intentos sigan subiendo', () => {
    expect(calcularCooldownMs(10)).toBe(30000)
    expect(calcularCooldownMs(50)).toBe(30000)
  })
})
