import { describe, expect, it } from 'vitest'
import type { TipoLabor } from '../../../../src/shared/types/domain.types'
import { crearTareasLabor } from '../../../../src/features/supervisor/utils/crear-tareas-labor'

function tipoLabor(codigo: string, nombre: string, orden: number): TipoLabor {
  return { id: codigo, codigo, nombre, icono: 'leaf', color: '#000', tieneCantidad: true, unidadMedida: 'tramos', pasoCantidad: 1, orden }
}

const COSECHA = tipoLabor('cosecha', 'Cosecha', 1)
const AMARRE_1 = tipoLabor('amarre_1', 'Amarre 1', 2)
const AMARRE_2 = tipoLabor('amarre_2', 'Amarre 2', 3)
const AMARRE_3 = tipoLabor('amarre_3', 'Amarre 3', 4)
const AMARRE_4 = tipoLabor('amarre_4', 'Amarre 4', 5)
const PALEA = tipoLabor('palea', 'Palea', 6)

describe('crearTareasLabor', () => {
  it('colapsa los cuatro amarres en una sola tarea con las cuatro opciones', () => {
    const tareas = crearTareasLabor([COSECHA, AMARRE_1, AMARRE_2, AMARRE_3, AMARRE_4, PALEA])

    expect(tareas.map((tarea) => tarea.id)).toEqual(['cosecha', 'amarre', 'palea'])

    const amarre = tareas[1]
    expect(amarre.tipoLabor.nombre).toBe('Amarre')
    expect(amarre.tipoLabor.codigo).toBe('amarre')
    expect(amarre.opciones.map((opcion) => opcion.etiqueta)).toEqual(['1', '2', '3', '4'])
    expect(amarre.opciones.map((opcion) => opcion.tipoLabor.id)).toEqual(['amarre_1', 'amarre_2', 'amarre_3', 'amarre_4'])
  })

  it('la tarea amarre conserva los datos de captura del primer amarre (unidad y paso)', () => {
    const [amarre] = crearTareasLabor([AMARRE_1, AMARRE_2])

    expect(amarre.tipoLabor.unidadMedida).toBe('tramos')
    expect(amarre.tipoLabor.pasoCantidad).toBe(1)
    expect(amarre.tipoLabor.tieneCantidad).toBe(true)
  })

  it('una labor normal queda como tarea con una sola opcion', () => {
    const [cosecha] = crearTareasLabor([COSECHA])

    expect(cosecha.id).toBe('cosecha')
    expect(cosecha.opciones).toHaveLength(1)
    expect(cosecha.opciones[0].etiqueta).toBe('Cosecha')
    expect(cosecha.opciones[0].tipoLabor).toBe(COSECHA)
  })

  it('inserta la tarea amarre en la posicion del primer amarre, no al final', () => {
    const tareas = crearTareasLabor([AMARRE_2, COSECHA, AMARRE_1])

    expect(tareas.map((tarea) => tarea.id)).toEqual(['amarre', 'cosecha'])
    expect(tareas[0].opciones.map((opcion) => opcion.tipoLabor.id)).toEqual(['amarre_2', 'amarre_1'])
  })

  it('sin amarres no inventa la tarea agrupada', () => {
    const tareas = crearTareasLabor([COSECHA, PALEA])

    expect(tareas.map((tarea) => tarea.id)).toEqual(['cosecha', 'palea'])
  })

  it('lista vacia devuelve lista vacia', () => {
    expect(crearTareasLabor([])).toEqual([])
  })
})
