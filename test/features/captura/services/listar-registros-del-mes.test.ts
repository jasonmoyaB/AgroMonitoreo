import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listarRegistrosDelMes } from '../../../../src/features/captura/services/registros-service'

const TAMANO_PAGINA = 1000

function filaEnFecha(indice: number) {
  return {
    id: `r${indice}`,
    finca_id: 'birrisito',
    trabajador_id: 't1',
    tipo_labor_id: 'cosecha',
    fecha: '2026-07-10',
    horas: 8,
    cantidad: 12,
    registrado_por: 'u1',
    creado_en: '2026-07-10T12:00:00Z',
  }
}

// Devuelve `total` filas cortando cada respuesta al maximo que permite PostgREST,
// que es exactamente como se truncaba en silencio antes de paginar.
function clientePaginado(total: number, maxFilasPorRespuesta = TAMANO_PAGINA) {
  const rangos: Array<[number, number]> = []
  const gte = vi.fn()
  const lt = vi.fn()
  const cadena = {
    select: vi.fn(() => cadena),
    gte: (...args: [string, string]) => {
      gte(...args)
      return cadena
    },
    lt: (...args: [string, string]) => {
      lt(...args)
      return cadena
    },
    order: vi.fn(() => cadena),
    range: (desde: number, hasta: number) => {
      rangos.push([desde, hasta])
      const pedidas = Math.min(hasta - desde + 1, maxFilasPorRespuesta)
      const disponibles = Math.max(Math.min(total - desde, pedidas), 0)
      return Promise.resolve({ data: Array.from({ length: disponibles }, (_, i) => filaEnFecha(desde + i)), error: null })
    },
  }

  return { client: { from: vi.fn(() => cadena) } as unknown as SupabaseClient, rangos, gte, lt }
}

describe('listarRegistrosDelMes', () => {
  it('acota la consulta al mes en el servidor', async () => {
    const { client, gte, lt } = clientePaginado(3)

    await listarRegistrosDelMes('2026-12', client)

    expect(gte).toHaveBeenCalledWith('fecha', '2026-12-01')
    expect(lt).toHaveBeenCalledWith('fecha', '2027-01-01')
  })

  it('trae el mes completo cuando supera el maximo de filas por respuesta', async () => {
    const total = TAMANO_PAGINA * 2 + 7
    const { client, rangos } = clientePaginado(total)

    const registros = await listarRegistrosDelMes('2026-07', client)

    expect(registros).toHaveLength(total)
    expect(new Set(registros.map((registro) => registro.id)).size).toBe(total)
    expect(rangos[1][0]).toBe(TAMANO_PAGINA)
  })

  it('no corta antes de tiempo si el servidor devuelve menos filas de las pedidas', async () => {
    const { client } = clientePaginado(1500, 500)

    expect(await listarRegistrosDelMes('2026-07', client)).toHaveLength(1500)
  })

  it('un mes vacio resuelve sin pedir una segunda pagina', async () => {
    const { client, rangos } = clientePaginado(0)

    expect(await listarRegistrosDelMes('2026-07', client)).toEqual([])
    expect(rangos).toHaveLength(1)
  })
})
