import { describe, expect, it } from 'vitest'
import { calcularHorasPorLabor } from '../../../../src/shared/utils/kpis/calcular-horas-por-labor'
import type { RegistroTrabajo, TipoLabor } from '../../../../src/shared/types/domain.types'

const TIPOS: readonly TipoLabor[] = [
  { id: 'cosecha', codigo: 'cosecha', nombre: 'Cosecha', icono: 'wheat', color: '#16a34a', tieneCantidad: true, unidadMedida: 'cajas', pasoCantidad: 1, orden: 1 },
  { id: 'deshija', codigo: 'deshija', nombre: 'Deshija', icono: 'scissors', color: '#dc2626', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden: 2 },
  { id: 'palea', codigo: 'palea', nombre: 'Palea', icono: 'shovel', color: '#78716c', tieneCantidad: true, unidadMedida: null, pasoCantidad: 1, orden: 3 },
]

function registro(tipoLaborId: string, horas: number, cantidad: number | null): RegistroTrabajo {
  return { id: `${tipoLaborId}-${horas}`, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId, fecha: '2026-08-14', horas, cantidad, registradoPor: 'u1', createdAt: '2026-08-14T12:00:00Z' }
}

describe('calcularHorasPorLabor', () => {
  it('acumula horas por labor y ordena de mayor a menor', () => {
    const filas = calcularHorasPorLabor([registro('deshija', 2, 4), registro('cosecha', 6, 30), registro('cosecha', 2, 10)], TIPOS)

    expect(filas.map((fila) => fila.id)).toEqual(['cosecha', 'deshija'])
    expect(filas[0].horas).toBe(8)
  })

  it('el porcentaje reparte el total de horas y suma 100', () => {
    const filas = calcularHorasPorLabor([registro('cosecha', 6, 12), registro('deshija', 2, 2)], TIPOS)

    expect(filas[0].porcentaje).toBe(75)
    expect(filas.reduce((suma, fila) => suma + fila.porcentaje, 0)).toBe(100)
  })

  it('el rendimiento es cantidad por hora y trata la cantidad nula como cero', () => {
    const filas = calcularHorasPorLabor([registro('cosecha', 4, 12), registro('deshija', 2, null)], TIPOS)

    expect(filas[0].rendimiento).toBe(3)
    expect(filas[1].rendimiento).toBe(0)
  })

  it('deja fuera las labores sin horas registradas', () => {
    const filas = calcularHorasPorLabor([registro('cosecha', 4, 12)], TIPOS)

    expect(filas).toHaveLength(1)
  })

  it('una labor que existe en la base pero no en la constante no se lleva parte del porcentaje', () => {
    const filas = calcularHorasPorLabor([registro('amarre_5', 4, 8), registro('cosecha', 4, 12)], TIPOS)

    expect(filas).toHaveLength(1)
    expect(filas[0].porcentaje).toBe(100)
  })

  it('solo labores desconocidas devuelve lista vacia', () => {
    expect(calcularHorasPorLabor([registro('amarre_5', 4, 8)], TIPOS)).toEqual([])
  })

  it('sin registros devuelve lista vacia en vez de dividir por cero', () => {
    expect(calcularHorasPorLabor([], TIPOS)).toEqual([])
  })

  it('una labor sin unidad de medida cae a unidades', () => {
    const filas = calcularHorasPorLabor([registro('palea', 3, 6)], TIPOS)

    expect(filas[0].unidad).toBe('unidades')
  })
})
