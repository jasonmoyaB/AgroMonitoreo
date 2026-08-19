import { describe, expect, it } from 'vitest'
import { construirProduccionDiaria } from '../../../../src/shared/utils/kpis/construir-produccion-diaria'

describe('construirProduccionDiaria', () => {
  it('rellena el mes calendario completo aunque la tendencia traiga pocos dias', () => {
    const produccion = construirProduccionDiaria('2026-08', [{ fecha: '2026-08-14', valor: 114 }])

    expect(produccion.dias).toHaveLength(31)
    expect(produccion.dias[13]).toEqual({ dia: 14, fecha: '2026-08-14', valor: 114 })
    expect(produccion.dias[0].valor).toBe(0)
  })

  it('febrero bisiesto termina el 29', () => {
    expect(construirProduccionDiaria('2028-02', []).dias).toHaveLength(29)
  })

  it('promedia solo los dias con registro, no los del mes', () => {
    const produccion = construirProduccionDiaria('2026-08', [
      { fecha: '2026-08-14', valor: 114 },
      { fecha: '2026-08-16', valor: 6 },
    ])

    expect(produccion.total).toBe(120)
    expect(produccion.diasConRegistro).toBe(2)
    expect(produccion.promedio).toBe(60)
  })

  it('el mejor dia es el de mayor valor y se queda con el primero al empatar', () => {
    const produccion = construirProduccionDiaria('2026-08', [
      { fecha: '2026-08-02', valor: 10 },
      { fecha: '2026-08-05', valor: 10 },
      { fecha: '2026-08-09', valor: 4 },
    ])

    expect(produccion.mejorDia?.fecha).toBe('2026-08-02')
    expect(produccion.maximo).toBe(10)
  })

  it('un mes sin registros no divide por cero', () => {
    const produccion = construirProduccionDiaria('2026-09', [])

    expect(produccion).toMatchObject({ total: 0, maximo: 0, promedio: 0, diasConRegistro: 0, mejorDia: null })
  })

  it('ignora fechas que no pertenecen al periodo pedido', () => {
    const produccion = construirProduccionDiaria('2026-08', [{ fecha: '2026-07-21', valor: 632 }])

    expect(produccion.diasConRegistro).toBe(0)
  })
})
