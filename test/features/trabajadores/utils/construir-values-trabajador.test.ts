import { describe, expect, it } from 'vitest'
import { construirValuesTrabajador } from '../../../../src/features/trabajadores/utils/construir-values-trabajador'
import type { Trabajador } from '../../../../src/shared/types/domain.types'

const TRABAJADOR: Trabajador = {
  id: 't1',
  fincaId: 'birrisito',
  nombreCompleto: 'Alvin Alcantara',
  fotoUrl: 'foto.jpg',
  activo: true,
  asegurado: true,
  cedula: '1-2345-6789',
  fechaIngreso: '2026-03-01',
  telefono: '8888-8888',
}

describe('construirValuesTrabajador', () => {
  it('sin trabajador devuelve el form vacio y activo', () => {
    expect(construirValuesTrabajador(null)).toEqual({
      nombreCompleto: '',
      fotoUrl: '',
      activo: true,
      cedula: '',
      fechaIngreso: '',
      telefono: '',
    })
  })

  it('copia los datos del trabajador tal cual', () => {
    const values = construirValuesTrabajador(TRABAJADOR)

    expect(values.cedula).toBe('1-2345-6789')
    expect(values.fechaIngreso).toBe('2026-03-01')
    expect(values.telefono).toBe('8888-8888')
  })

  // un input controlado con value={null} pasa a no controlado y React avisa; ademas
  // el null viajaria al service, donde aNullSiVacio espera string y haria .trim()
  it('convierte cada null del dominio en cadena vacia, no en null', () => {
    const values = construirValuesTrabajador({ ...TRABAJADOR, cedula: null, fechaIngreso: null, telefono: null, fotoUrl: null })

    expect(values.cedula).toBe('')
    expect(values.fechaIngreso).toBe('')
    expect(values.telefono).toBe('')
    expect(values.fotoUrl).toBe('')
  })

  // activo false es un valor real, no "ausente": con `||` en vez de `??` un
  // trabajador inactivo se abriria como activo en el form
  it('respeta activo en false en vez de caer al default', () => {
    expect(construirValuesTrabajador({ ...TRABAJADOR, activo: false }).activo).toBe(false)
  })

  // el seguro lo maneja solo la oficina: si el form del supervisor lo mandara, cada
  // guardado pisaria el valor que el admin acaba de poner
  it('no expone asegurado: ese campo no lo toca el supervisor', () => {
    expect(construirValuesTrabajador(TRABAJADOR)).not.toHaveProperty('asegurado')
  })
})
