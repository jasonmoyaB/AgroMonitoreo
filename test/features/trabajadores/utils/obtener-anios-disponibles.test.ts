import { describe, expect, it } from 'vitest'
import type { RegistroTrabajo } from '../../../../src/shared/types/domain.types'
import { obtenerAniosDisponibles } from '../../../../src/features/trabajadores/utils/obtener-anios-disponibles'

function registro(fecha: string): RegistroTrabajo {
  return { id: fecha, fincaId: 'birrisito', trabajadorId: 't1', tipoLaborId: 'cosecha', fecha, horas: 8, cantidad: null, registradoPor: 'u1', createdAt: `${fecha}T12:00:00Z` }
}

describe('obtenerAniosDisponibles', () => {
  it('devuelve los anios sin repetir y del mas reciente al mas viejo', () => {
    const registros = [registro('2024-05-01'), registro('2026-07-10'), registro('2025-01-30'), registro('2026-01-02')]

    expect(obtenerAniosDisponibles(registros)).toEqual([2026, 2025, 2024])
  })

  it('sin registros devuelve lista vacia', () => {
    expect(obtenerAniosDisponibles([])).toEqual([])
  })

  it('devuelve numeros, no strings (el select compara por valor numerico)', () => {
    expect(obtenerAniosDisponibles([registro('2026-07-10')])).toEqual([2026])
  })
})
