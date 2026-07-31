import { describe, expect, it } from 'vitest'
import type { TipoLabor } from '../../../../src/shared/types/domain.types'
import { REGISTRADO_POR_LOCAL } from '../../../../src/features/captura/constants/captura.constants'
import { construirRegistro } from '../../../../src/features/captura/utils/construir-registro'

function tipoLabor(id: string, tieneCantidad: boolean): TipoLabor {
  return { id, codigo: id, nombre: id, icono: 'leaf', color: '#000', tieneCantidad, unidadMedida: tieneCantidad ? 'cajas' : null, pasoCantidad: 1, orden: 1 }
}

const PARAMS_BASE = { fincaId: 'birrisito', trabajadorId: 't1', fecha: '2026-07-28', horas: 7.5, cantidad: 12 }

describe('construirRegistro', () => {
  it('guarda la cantidad cuando la labor la lleva', () => {
    const registro = construirRegistro({ ...PARAMS_BASE, tipoLabor: tipoLabor('cosecha', true) })

    expect(registro.cantidad).toBe(12)
    expect(registro.tipoLaborId).toBe('cosecha')
    expect(registro.horas).toBe(7.5)
    expect(registro.fecha).toBe('2026-07-28')
    expect(registro.fincaId).toBe('birrisito')
    expect(registro.trabajadorId).toBe('t1')
  })

  it('descarta la cantidad cuando la labor no la lleva, aunque el stepper haya quedado en un valor', () => {
    const registro = construirRegistro({ ...PARAMS_BASE, tipoLabor: tipoLabor('deshierba', false) })

    expect(registro.cantidad).toBeNull()
  })

  it('marca el registro como capturado en campo y le da un id unico', () => {
    const primero = construirRegistro({ ...PARAMS_BASE, tipoLabor: tipoLabor('cosecha', true) })
    const segundo = construirRegistro({ ...PARAMS_BASE, tipoLabor: tipoLabor('cosecha', true) })

    expect(primero.registradoPor).toBe(REGISTRADO_POR_LOCAL)
    expect(primero.id).not.toBe(segundo.id)
    expect(primero.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
