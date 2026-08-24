import { beforeEach, describe, expect, it } from 'vitest'
import { useCapturaSessionStore } from '../../../src/shared/stores/captura-session-store'

describe('capturaSessionStore', () => {
  beforeEach(() => useCapturaSessionStore.getState().reiniciar())

  // El default no puede ser el ISO de hoy: se congelaria al cargar el modulo y la PWA de
  // campo queda instalada dias, escribiendo con la fecha vieja.
  it('arranca sin fecha elegida', () => {
    expect(useCapturaSessionStore.getState().fecha).toBeNull()
  })

  it('guarda la fecha que eligio el capataz', () => {
    useCapturaSessionStore.getState().establecerFecha('2026-08-18')
    expect(useCapturaSessionStore.getState().fecha).toBe('2026-08-18')
  })

  it('reiniciar borra la fecha y la labor elegidas', () => {
    useCapturaSessionStore.getState().seleccionarLabor('cosecha')
    useCapturaSessionStore.getState().establecerFecha('2026-08-18')
    useCapturaSessionStore.getState().reiniciar()
    expect(useCapturaSessionStore.getState()).toMatchObject({ fecha: null, tipoLaborId: null })
  })
})
