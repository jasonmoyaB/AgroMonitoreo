import { afterEach, describe, expect, it, vi } from 'vitest'
import { fechaLocalIso } from '../../../src/shared/utils/fecha-local'

afterEach(() => vi.useRealTimers())

function fechaLocalEsperada(offsetDias = 0): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + offsetDias)
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

describe('fechaLocalIso', () => {
  // mediodia UTC: mismo dia calendario en cualquier zona entre UTC-11 y UTC+11,
  // asi que estos tres casos no dependen de la TZ del runner
  it('suma el offset en dias', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-28T12:00:00.000Z'))

    expect(fechaLocalIso(1)).toBe('2026-07-29')
  })

  it('cruza el fin de mes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-31T12:00:00.000Z'))

    expect(fechaLocalIso(1)).toBe('2026-08-01')
  })

  it('rellena mes y dia con cero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T12:00:00.000Z'))

    expect(fechaLocalIso()).toBe('2026-01-05')
  })

  it('se queda en el dia local aunque en UTC ya sea el siguiente', () => {
    // 28/07 19:00 en Costa Rica (UTC-6) = 29/07 01:00 UTC.
    // toISOString().slice(0, 10) devuelve 2026-07-29; el capataz esta en el 28.
    // Solo muerde en runners con offset negativo; en UTC pasa por definicion.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T01:00:00.000Z'))

    expect(fechaLocalIso()).toBe(fechaLocalEsperada())
  })
})
