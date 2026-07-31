import { describe, expect, it } from 'vitest'
import { resumirResultados } from '../../../../src/features/traslados/utils/resumir-resultados'

const ok: PromiseSettledResult<unknown> = { status: 'fulfilled', value: undefined }
const falla = (mensaje: string): PromiseSettledResult<unknown> => ({ status: 'rejected', reason: new Error(mensaje) })

describe('resumirResultados', () => {
  it('cuenta todo exitoso', () => {
    expect(resumirResultados([ok, ok, ok])).toEqual({ exitosos: 3, fallidos: 0, primerError: null })
  })

  it('cuenta exito parcial y guarda el primer error', () => {
    // el caso que Promise.all escondia: 3 solicitudes creadas, 2 rechazadas por el
    // indice unico, y la UI diciendo que no paso nada
    const resumen = resumirResultados([ok, falla('duplicate key'), ok, falla('otro'), ok])

    expect(resumen).toEqual({ exitosos: 3, fallidos: 2, primerError: 'duplicate key' })
  })

  it('cuenta todo fallido', () => {
    expect(resumirResultados([falla('boom')])).toEqual({ exitosos: 0, fallidos: 1, primerError: 'boom' })
  })

  it('serializa razones que no son Error', () => {
    expect(resumirResultados([{ status: 'rejected', reason: 'texto pelado' }]).primerError).toBe('texto pelado')
  })

  it('tolera lista vacia', () => {
    expect(resumirResultados([])).toEqual({ exitosos: 0, fallidos: 0, primerError: null })
  })
})
