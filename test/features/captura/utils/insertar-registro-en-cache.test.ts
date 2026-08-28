import { describe, expect, it } from 'vitest'
import { insertarRegistroEnCache } from '../../../../src/features/captura/utils/insertar-registro-en-cache'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'

function registro(campos: Partial<RegistroTrabajo>): RegistroTrabajo {
  return {
    id: 'r1',
    fincaId: 'birrisito',
    trabajadorId: 't1',
    tipoLaborId: 'cosecha',
    fecha: '2026-07-10',
    horas: 8,
    cantidad: 12,
    registradoPor: 'capataz-local',
    createdAt: '2026-07-10T12:00:00Z',
    ...campos,
  }
}

describe('insertarRegistroEnCache', () => {
  it('agrega el registro cuando ese trabajador no tenia esa labor cargada', () => {
    const previos = [registro({ id: 'r1', trabajadorId: 't1' })]

    const resultado = insertarRegistroEnCache(previos, registro({ id: 'r2', trabajadorId: 't2' }))

    expect(resultado.map((item) => item.id)).toEqual(['r1', 'r2'])
  })

  it('agrega cuando es el mismo trabajador pero otra labor', () => {
    const previos = [registro({ id: 'r1', tipoLaborId: 'cosecha' })]

    const resultado = insertarRegistroEnCache(previos, registro({ id: 'r2', tipoLaborId: 'deshija' }))

    expect(resultado).toHaveLength(2)
  })

  it('reemplaza en vez de duplicar cuando se corrige el mismo trabajador y labor', () => {
    const previos = [registro({ id: 'r1', horas: 4 }), registro({ id: 'otro', trabajadorId: 't2' })]

    const resultado = insertarRegistroEnCache(previos, registro({ id: 'r1-corregido', horas: 8 }))

    expect(resultado).toHaveLength(2)
    expect(resultado[0].horas).toBe(8)
    expect(resultado[0].id).toBe('r1-corregido')
  })

  it('no muta el arreglo recibido', () => {
    const previos = [registro({ id: 'r1' })]

    insertarRegistroEnCache(previos, registro({ id: 'r2', trabajadorId: 't2' }))

    expect(previos).toHaveLength(1)
  })

  it('sobre una cache vacia deja un solo registro', () => {
    expect(insertarRegistroEnCache([], registro({}))).toHaveLength(1)
  })
})
