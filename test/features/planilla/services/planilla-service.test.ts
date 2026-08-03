import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listarPagosQuincena, registrarPagoQuincena } from '../../../../src/features/planilla/services/planilla-service'
import type { NuevoPagoQuincenal } from '../../../../src/features/planilla/types/planilla.types'

interface RespuestaSupabase {
  data?: unknown
  error?: { message: string } | null
}

interface Cadena {
  select: (...args: unknown[]) => Cadena
  eq: (...args: unknown[]) => Cadena
  returns: () => Promise<{ data: unknown; error: { message: string } | null }>
}

function clienteLectura(respuesta: RespuestaSupabase) {
  const select = vi.fn()
  const eq = vi.fn()
  const cadena: Cadena = {
    select: (...args: unknown[]) => {
      select(...args)
      return cadena
    },
    eq: (...args: unknown[]) => {
      eq(...args)
      return cadena
    },
    returns: () => Promise.resolve({ data: respuesta.data ?? null, error: respuesta.error ?? null }),
  }
  const from = vi.fn(() => cadena)

  return { client: { from } as unknown as SupabaseClient, from, select, eq }
}

function clienteEscritura(error: { message: string } | null = null) {
  const insert = vi.fn((_fila: Record<string, unknown>) => Promise.resolve({ error }))
  const from = vi.fn(() => ({ insert }))

  return { client: { from } as unknown as SupabaseClient, from, insert }
}

// un dia ausente a 1750 x 8 = 14 000, asi que el neto y el bruto son distintos a proposito:
// si el service los cruza, cualquier assert sobre monto lo detecta
function crearPago(overrides: Partial<NuevoPagoQuincenal> = {}): NuevoPagoQuincenal {
  return {
    fincaId: 'birrisito',
    trabajadorId: 't1',
    quincenaInicio: '2026-07-16',
    quincenaFin: '2026-07-31',
    monto: 186_000,
    montoBruto: 200_000,
    diasAusentes: 1,
    moneda: 'colones',
    ...overrides,
  }
}

describe('listarPagosQuincena', () => {
  it('mapea la fila a camelCase sin cruzar monto con montoBruto', async () => {
    const { client } = clienteLectura({
      data: [
        {
          id: 'p1',
          trabajador_id: 't1',
          quincena_inicio: '2026-07-16',
          quincena_fin: '2026-07-31',
          monto: 186_000,
          monto_bruto: 200_000,
          dias_ausentes: 1,
          moneda: 'colones',
          creado_en: '2026-07-31T18:00:00Z',
        },
      ],
    })

    expect(await listarPagosQuincena('birrisito', '2026-07-16', client)).toEqual([
      {
        id: 'p1',
        trabajadorId: 't1',
        quincenaInicio: '2026-07-16',
        quincenaFin: '2026-07-31',
        monto: 186_000,
        montoBruto: 200_000,
        diasAusentes: 1,
        moneda: 'colones',
        creadoEn: '2026-07-31T18:00:00Z',
      },
    ])
  })

  it('filtra por la finca y por el inicio de quincena pedidos', async () => {
    const { client, from, eq } = clienteLectura({ data: [] })

    await listarPagosQuincena('la-flor', '2026-08-01', client)

    expect(from).toHaveBeenCalledWith('pagos_quincenales')
    expect(eq).toHaveBeenCalledWith('finca_id', 'la-flor')
    expect(eq).toHaveBeenCalledWith('quincena_inicio', '2026-08-01')
  })

  // la tabla no tiene policy de UPDATE ni DELETE: si el select deja de pedir estas dos
  // columnas, montoBruto y diasAusentes quedan undefined, la liquidacion reimpresa no
  // puede explicar el neto y la fila ya no se corrige, solo se le suma un ajuste
  it('pide las columnas del snapshot que explican el neto', async () => {
    const { client, select } = clienteLectura({ data: [] })

    await listarPagosQuincena('birrisito', '2026-07-16', client)

    expect(select).toHaveBeenCalledWith(expect.stringContaining('monto_bruto'))
    expect(select).toHaveBeenCalledWith(expect.stringContaining('dias_ausentes'))
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteLectura({ error: { message: 'permission denied' } })

    await expect(listarPagosQuincena('birrisito', '2026-07-16', client)).rejects.toThrow('listarPagosQuincena: permission denied')
  })
})

describe('registrarPagoQuincena', () => {
  it('manda el neto en monto y el bruto en monto_bruto, sin intercambiarlos', async () => {
    const { client, from, insert } = clienteEscritura()

    await registrarPagoQuincena(crearPago(), client)

    expect(from).toHaveBeenCalledWith('pagos_quincenales')
    const [fila] = insert.mock.calls[0]
    expect(fila.monto).toBe(186_000)
    expect(fila.monto_bruto).toBe(200_000)
    expect(fila.dias_ausentes).toBe(1)
    expect(fila.moneda).toBe('colones')
  })

  it('identifica el pago por finca, trabajador e inicio y fin de quincena', async () => {
    const { client, insert } = clienteEscritura()

    await registrarPagoQuincena(crearPago({ fincaId: 'la-flor', trabajadorId: 't9' }), client)

    const [fila] = insert.mock.calls[0]
    expect(fila.finca_id).toBe('la-flor')
    expect(fila.trabajador_id).toBe('t9')
    expect(fila.quincena_inicio).toBe('2026-07-16')
    expect(fila.quincena_fin).toBe('2026-07-31')
  })

  // el cliente se tipa como SupabaseClient sin <Database>, asi que tsc no valida los
  // nombres de columna: en camelCase PostgREST responde PGRST204 y el pago no entra
  it('manda las columnas en snake_case, no en el camelCase del dominio', async () => {
    const { client, insert } = clienteEscritura()

    await registrarPagoQuincena(crearPago(), client)

    const [fila] = insert.mock.calls[0]
    expect(fila).not.toHaveProperty('montoBruto')
    expect(fila).not.toHaveProperty('diasAusentes')
    expect(fila).not.toHaveProperty('trabajadorId')
    expect(fila).not.toHaveProperty('fincaId')
  })

  // registrado_por entra por el default usuario_actual_id() (auth.uid() -> usuario.id).
  // mandarlo desde el cliente deja que el navegador elija quien firma el pago
  it('no manda registrado_por: ese campo lo pone la base', async () => {
    const { client, insert } = clienteEscritura()

    await registrarPagoQuincena(crearPago(), client)

    expect(insert.mock.calls[0][0]).not.toHaveProperty('registrado_por')
  })

  it('un pago en dolares viaja con su moneda, no con la de la finca', async () => {
    const { client, insert } = clienteEscritura()

    await registrarPagoQuincena(crearPago({ monto: 425.5, montoBruto: 425.5, diasAusentes: 0, moneda: 'usd' }), client)

    const [fila] = insert.mock.calls[0]
    expect(fila.moneda).toBe('usd')
    expect(fila.monto).toBe(425.5)
    expect(fila.dias_ausentes).toBe(0)
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteEscritura({ message: 'duplicate key value' })

    await expect(registrarPagoQuincena(crearPago(), client)).rejects.toThrow('registrarPagoQuincena: duplicate key value')
  })
})
