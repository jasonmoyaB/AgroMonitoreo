import { COOLDOWN_BASE_MS, COOLDOWN_MAX_MS, MAX_INTENTOS_ANTES_DE_COOLDOWN } from '../constants/rate-limit.constants'

export function calcularCooldownMs(intentosFallidos: number): number {
  if (intentosFallidos < MAX_INTENTOS_ANTES_DE_COOLDOWN) return 0

  const exponente = intentosFallidos - MAX_INTENTOS_ANTES_DE_COOLDOWN
  return Math.min(COOLDOWN_BASE_MS * 2 ** exponente, COOLDOWN_MAX_MS)
}
