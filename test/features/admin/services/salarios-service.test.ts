import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { guardarSalario, listarSalariosPorFinca } from '../../../../src/features/admin/services/salarios-service'

interface RespuestaSupabase {
  data?: unknown
  error?: { message: string } | null
}

function clienteLectura(respuesta: RespuestaSupabase) {
  const eq = vi.fn()
  const cadena = {
    select: vi.fn(() => cadena),
    eq: (...args: unknown[]) => {
      eq(...args)
      return cadena
    },
    order: vi.fn(() => cadena),
    returns: vi.fn(() => Promise.resolve({ data: respuesta.data ?? null, error: respuesta.error ?? null })),
  }
  const from = vi.fn(() => cadena)

  return { client: { from } as unknown as SupabaseClient, from, eq, cadena }
}

function clienteEscritura(error: { message: string } | null = null) {
  const upsert = vi.fn((_fila: Record<string, unknown>) => Promise.resolve({ error }))
  const from = vi.fn(() => ({ upsert }))

  return { client: { from } as unknown as SupabaseClient, from, upsert }
}

describe('listarSalariosPorFinca', () => {
  it('mapea la fila anidada de salarios a la forma del dominio', async () => {
    const { client } = clienteLectura({
      data: [{ id: 't1', nombre_completo: 'Alvin Alcantara', foto_url: 'foto.jpg', salario: { salario_mensual: 350000, moneda: 'colones' } }],
    })

    expect(await listarSalariosPorFinca('birrisito', client)).toEqual([
      { trabajadorId: 't1', nombreCompleto: 'Alvin Alcantara', fotoUrl: 'foto.jpg', salarioMensual: 350000, moneda: 'colones' },
    ])
  })

  it('un trabajador sin fila de salario cae en cero colones, no en NaN ni undefined', async () => {
    const { client } = clienteLectura({
      data: [{ id: 't2', nombre_completo: 'Maria Rojas', foto_url: null, salario: null }],
    })

    const [salario] = await listarSalariosPorFinca('birrisito', client)

    expect(salario.salarioMensual).toBe(0)
    expect(salario.moneda).toBe('colones')
    expect(salario.fotoUrl).toBeNull()
  })

  it('respeta un salario de cero guardado a proposito en dolares', async () => {
    const { client } = clienteLectura({
      data: [{ id: 't3', nombre_completo: 'Pedro Mora', foto_url: null, salario: { salario_mensual: 0, moneda: 'usd' } }],
    })

    const [salario] = await listarSalariosPorFinca('birrisito', client)

    expect(salario.salarioMensual).toBe(0)
    expect(salario.moneda).toBe('usd')
  })

  it('filtra por la finca pedida y ordena por nombre', async () => {
    const { client, from, eq, cadena } = clienteLectura({ data: [] })

    await listarSalariosPorFinca('la-flor', client)

    expect(from).toHaveBeenCalledWith('trabajadores')
    expect(eq).toHaveBeenCalledWith('finca_id', 'la-flor')
    expect(cadena.order).toHaveBeenCalledWith('nombre_completo', { ascending: true })
  })

  // el doble devuelve la fila que le pasa el test, asi que si el alias del embed se
  // rompe (salario: -> salarios:) row.salario queda undefined, el ?? 0 lo tapa y la
  // planilla entera se muestra en cero sin error. esto ancla el nombre del alias.
  it('pide el embed de salarios con el alias que espera el mapeo', async () => {
    const { client, cadena } = clienteLectura({ data: [] })

    await listarSalariosPorFinca('birrisito', client)

    expect(cadena.select).toHaveBeenCalledWith(expect.stringContaining('salario:salarios_trabajadores(salario_mensual, moneda)'))
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteLectura({ error: { message: 'permission denied' } })

    await expect(listarSalariosPorFinca('birrisito', client)).rejects.toThrow('listarSalariosPorFinca: permission denied')
  })
})

describe('guardarSalario', () => {
  it('manda solo el campo cambiado, sin pisar el otro', async () => {
    const { client, from, upsert } = clienteEscritura()

    await guardarSalario({ trabajadorId: 't1', moneda: 'usd' }, client)

    expect(from).toHaveBeenCalledWith('salarios_trabajadores')
    const [fila] = upsert.mock.calls[0]
    expect(fila.trabajador_id).toBe('t1')
    expect(fila.moneda).toBe('usd')
    expect(fila).not.toHaveProperty('salario_mensual')
    expect(fila).not.toHaveProperty('trabajadorId')
  })

  // el cliente se tipa como SupabaseClient sin <Database>, asi que tsc no valida los
  // nombres de columna: si vuelven a mandarse en camelCase PostgREST responde PGRST204
  it('manda el salario con el nombre de columna real, en snake_case', async () => {
    const { client, upsert } = clienteEscritura()

    await guardarSalario({ trabajadorId: 't1', salarioMensual: 420000 }, client)

    const [fila] = upsert.mock.calls[0]
    expect(fila).toHaveProperty('salario_mensual', 420000)
    expect(fila).not.toHaveProperty('salarioMensual')
  })

  // actualizado_en lo sella el trigger salarios_trabajadores_tocar_actualizado_en
  // (20260729120000). si el cliente lo vuelve a mandar, el reloj de la maquina del
  // admin sobreescribe el de la BD en el insert del upsert.
  it('no manda actualizado_en: ese campo lo pone la base', async () => {
    const { client, upsert } = clienteEscritura()

    await guardarSalario({ trabajadorId: 't1', salarioMensual: 420000 }, client)

    expect(upsert.mock.calls[0][0]).not.toHaveProperty('actualizado_en')
  })

  it('un salario de cero se manda, no se descarta como campo ausente', async () => {
    const { client, upsert } = clienteEscritura()

    await guardarSalario({ trabajadorId: 't1', salarioMensual: 0 }, client)

    const [fila] = upsert.mock.calls[0]
    expect(fila).toHaveProperty('salario_mensual', 0)
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteEscritura({ message: 'row level security' })

    await expect(guardarSalario({ trabajadorId: 't1', moneda: 'usd' }, client)).rejects.toThrow('guardarSalario: row level security')
  })
})
