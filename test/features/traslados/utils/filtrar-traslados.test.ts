import { describe, expect, it } from 'vitest'
import { FILTROS_TRASLADOS_VACIOS, filtrarTraslados } from '../../../../src/features/traslados/utils/filtrar-traslados'
import type { Traslado } from '../../../../src/features/traslados/types/traslado.types'

const PROPIA = 'finca-propia'

function crearTraslado(parcial: Partial<Traslado>): Traslado {
  return {
    id: '1',
    trabajadorId: 't1',
    trabajadorNombre: 'Juan Pérez',
    fincaOrigenId: PROPIA,
    fincaOrigenNombre: 'Birrisito',
    fincaDestinoId: 'otra',
    fincaDestinoNombre: 'La Ceiba',
    fecha: '2026-07-15',
    estado: 'aprobado',
    ...parcial,
  }
}

const TRASLADOS: Traslado[] = [
  crearTraslado({ id: '1' }),
  crearTraslado({ id: '2', trabajadorNombre: 'María Solís', fecha: '2026-07-01', estado: 'rechazado' }),
  crearTraslado({ id: '3', trabajadorNombre: 'Carlos Mora', fecha: '2026-08-02', fincaOrigenId: 'otra', fincaOrigenNombre: 'La Ceiba', fincaDestinoId: PROPIA, fincaDestinoNombre: 'Birrisito' }),
]

function ids(filtros: Partial<typeof FILTROS_TRASLADOS_VACIOS>, fincaPropiaId = '') {
  return filtrarTraslados(TRASLADOS, { ...FILTROS_TRASLADOS_VACIOS, ...filtros }, fincaPropiaId).map((traslado) => traslado.id)
}

describe('filtrarTraslados', () => {
  it('sin filtros devuelve todo', () => {
    expect(ids({})).toEqual(['1', '2', '3'])
  })

  it('busca por nombre sin importar mayúsculas ni espacios', () => {
    expect(ids({ trabajador: '  marÍa ' })).toEqual(['2'])
  })

  it('filtra por estado', () => {
    expect(ids({ estado: 'rechazado' })).toEqual(['2'])
  })

  it('la finca matchea tanto origen como destino', () => {
    expect(ids({ finca: 'La Ceiba' })).toEqual(['1', '2', '3'])
  })

  it('el rango de fechas incluye los extremos', () => {
    expect(ids({ desde: '2026-07-01', hasta: '2026-07-15' })).toEqual(['1', '2'])
  })

  it('recibido es donde la finca propia es destino, prestado donde es origen', () => {
    expect(ids({ sentido: 'recibido' }, PROPIA)).toEqual(['3'])
    expect(ids({ sentido: 'prestado' }, PROPIA)).toEqual(['1', '2'])
  })

  it('sin finca propia el sentido no filtra nada', () => {
    expect(ids({ sentido: 'recibido' })).toEqual(['1', '2', '3'])
  })
})
