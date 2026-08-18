import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { crearTrabajador, listarTodosTrabajadoresPorFinca, listarTrabajadoresPorFinca } from '../../../../src/features/trabajadores/services/trabajadores-service'
import type { TrabajadorFormValues } from '../../../../src/features/trabajadores/types/trabajador-form.types'

const VALUES_BASE: TrabajadorFormValues = {
  nombreCompleto: 'Alvin Alcantara',
  fotoUrl: '',
  activo: true,
  cedula: '',
  fechaIngreso: '',
  telefono: '',
}

// Las respuestas se tipan a mano en vez de dejar que vi.fn las infiera del happy path.
// Sin esto TS deduce `error: null` a secas y `mockResolvedValueOnce({ error: {...} })`
// deja de compilar, y los espias quedan sin parametros declarados, asi que
// `mock.calls[0][0]` es un acceso fuera de una tupla vacia.
interface ErrorFalso {
  code?: string
  message: string
}

type RespuestaEscritura = { error: ErrorFalso | null }
type RespuestaInsert = { data: { id: string } | null; error: ErrorFalso | null }

type FilaEscrita = Record<string, unknown>

// dos tablas en el mismo flujo: trabajadores devuelve el id, datos_trabajadores
// captura el upsert. `tablas` guarda a que tabla fue cada llamada.
function clienteDosTablas() {
  const upsert = vi.fn((_fila: FilaEscrita): Promise<RespuestaEscritura> => Promise.resolve({ error: null }))
  const insert = vi.fn((_fila: FilaEscrita) => ({
    select: () => ({ single: (): Promise<RespuestaInsert> => Promise.resolve({ data: { id: 't-nuevo' }, error: null }) }),
  }))
  const eq = vi.fn((_columna: string, _valor: string): Promise<RespuestaEscritura> => Promise.resolve({ error: null }))
  const update = vi.fn((_cambios: FilaEscrita) => ({ eq }))
  const borrar = vi.fn(() => ({ eq }))
  const tablas: string[] = []
  const from = vi.fn((tabla: string) => {
    tablas.push(tabla)
    return { insert, upsert, update, delete: borrar }
  })

  return { client: { from } as unknown as SupabaseClient, upsert, insert, update, borrar, eq, tablas }
}

async function crearCon(values: Partial<TrabajadorFormValues>) {
  const doble = clienteDosTablas()
  await crearTrabajador({ ...VALUES_BASE, ...values, fincaId: 'birrisito' }, doble.client)

  return { ...doble, fila: doble.upsert.mock.calls[0][0] }
}

function clienteLectura() {
  const cadena = {
    select: vi.fn(() => cadena),
    eq: vi.fn(() => cadena),
    order: vi.fn(() => cadena),
    returns: vi.fn(() => Promise.resolve({ data: [], error: null })),
  }

  return { client: { from: vi.fn(() => cadena) } as unknown as SupabaseClient, cadena }
}

// Este seam no puede reproducir PGRST201: el doble no resuelve embeds, eso lo hace
// PostgREST. Lo que si ancla es el string, que es donde estuvo el bug — el embed
// quedo ambiguo y la pantalla de trabajadores dejo de cargar entera.
describe('el embed de datos_trabajadores', () => {
  it('nombra el FK explicito: sin el, PostgREST responde PGRST201 y no carga nada', async () => {
    const { client, cadena } = clienteLectura()

    await listarTodosTrabajadoresPorFinca('birrisito', client)

    expect(cadena.select).toHaveBeenCalledWith(expect.stringContaining('datos:datos_trabajadores!datos_trabajadores_trabajador_id_fkey('))
  })

  // la grilla del capataz solo pinta nombre y foto: el embed ahi es un join por carga
  // y PII (cedula, telefono) viajando a un dispositivo de campo que no la usa.
  it('no viaja en la lectura de captura, que no muestra datos personales', async () => {
    const { client, cadena } = clienteLectura()

    await listarTrabajadoresPorFinca('birrisito', client)

    expect(cadena.select).not.toHaveBeenCalledWith(expect.stringContaining('datos_trabajadores'))
  })

  // por finca_coincide el embed tambien resuelve, pero devuelve array en vez de
  // objeto: mapearTrabajador lee row.datos?.cedula y todas las cedulas irian en null
  // sin ningun error visible. Es peor que el PGRST201, que al menos se ve.
  it('no usa el FK compuesto, que devolveria un array', async () => {
    const { client, cadena } = clienteLectura()

    await listarTodosTrabajadoresPorFinca('birrisito', client)

    expect(cadena.select).not.toHaveBeenCalledWith(expect.stringContaining('datos_trabajadores_finca_coincide'))
  })
})

describe('crearTrabajador', () => {
  // el indice unico parcial de cedula es `where cedula is not null`: si un input vacio
  // guardara '', dos trabajadores sin cedula chocarian entre si al segundo alta.
  it('convierte los datos personales vacios en null, no en cadena vacia', async () => {
    const { fila } = await crearCon({})

    expect(fila.cedula).toBeNull()
    expect(fila.fecha_ingreso).toBeNull()
    expect(fila.telefono).toBeNull()
  })

  it('recorta los espacios y guarda el valor real cuando viene cargado', async () => {
    const { fila } = await crearCon({ cedula: '  1-2345-6789  ', fechaIngreso: '2026-03-01', telefono: ' 8888-8888 ' })

    expect(fila.cedula).toBe('1-2345-6789')
    expect(fila.fecha_ingreso).toBe('2026-03-01')
    expect(fila.telefono).toBe('8888-8888')
  })

  // una cedula de solo espacios no es una cedula: tiene que caer en null igual que ''
  it('trata una cedula de solo espacios como ausente', async () => {
    const { fila } = await crearCon({ cedula: '   ' })

    expect(fila.cedula).toBeNull()
  })

  // el cliente se tipa como SupabaseClient sin <Database>, asi que tsc no valida los
  // nombres de columna: en camelCase PostgREST responde PGRST204
  // si el alta mandara asegurado, el supervisor estaria fijando un dato que solo la
  // oficina decide, y en el editar pisaria lo que el admin acaba de poner
  it('no manda asegurado: ese campo lo pone la oficina, no el supervisor', async () => {
    const doble = clienteDosTablas()
    await crearTrabajador({ ...VALUES_BASE, fincaId: 'birrisito' }, doble.client)

    expect(doble.insert.mock.calls[0][0]).not.toHaveProperty('asegurado')
  })

  it('escribe en las dos tablas, con el id nuevo y las columnas en snake_case', async () => {
    const { fila, tablas } = await crearCon({ cedula: '1-1111-1111' })

    expect(tablas).toEqual(['trabajadores', 'datos_trabajadores'])
    expect(fila.trabajador_id).toBe('t-nuevo')
    expect(fila.finca_id).toBe('birrisito')
    expect(fila).not.toHaveProperty('fechaIngreso')
  })

  it('propaga el error de supabase sin llegar a escribir los datos personales', async () => {
    const doble = clienteDosTablas()
    doble.insert.mockReturnValueOnce({
      select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'duplicate key' } }) }),
    })

    await expect(crearTrabajador({ ...VALUES_BASE, fincaId: 'birrisito' }, doble.client)).rejects.toThrow('crearTrabajador: duplicate key')
    expect(doble.upsert).not.toHaveBeenCalled()
  })

  // el caso real: dos trabajadores de la misma finca con la misma cedula. El insert
  // en trabajadores entra, el upsert choca con datos_trabajadores_finca_cedula_idx.
  // Sin compensar, el trabajador queda vivo, el form sigue en modo crear y el
  // reintento con la cedula corregida lo duplica.
  it('desactiva el trabajador recien creado si falla el guardado de los datos personales', async () => {
    const doble = clienteDosTablas()
    doble.upsert.mockResolvedValueOnce({ error: { message: 'duplicate key value violates unique constraint' } })

    await expect(crearTrabajador({ ...VALUES_BASE, cedula: '1-1111-1111', fincaId: 'birrisito' }, doble.client)).rejects.toThrow('guardarDatosTrabajador')
    expect(doble.update).toHaveBeenCalledWith({ activo: false })
    expect(doble.eq).toHaveBeenCalledWith('id', 't-nuevo')
  })

  // Este es el corazon del bug, y el seam de mocks no lo ve: `.delete()` compilaba,
  // corria y devolvia error null, pero sobre public.trabajadores no hay ninguna policy
  // de DELETE, asi que RLS no matcheaba filas y PostgREST respondia 204. La
  // compensacion no compensaba nada. El test ancla la unica escritura que la RLS del
  // supervisor si permite (trabajadores_update_own_finca); si alguien vuelve al delete,
  // falla aca en vez de fallar en la finca.
  it('no intenta borrar: no existe policy de DELETE sobre trabajadores', async () => {
    const doble = clienteDosTablas()
    doble.upsert.mockResolvedValueOnce({ error: { message: 'duplicate key' } })

    await expect(crearTrabajador({ ...VALUES_BASE, fincaId: 'birrisito' }, doble.client)).rejects.toThrow()
    expect(doble.borrar).not.toHaveBeenCalled()
  })

  // si tampoco se puede revertir, la fila queda activa y el proximo intento duplica al
  // trabajador: eso pesa mas que la cedula repetida, asi que ese es el error que sale.
  it('avisa del trabajador a medias cuando la reversion tambien falla', async () => {
    const doble = clienteDosTablas()
    doble.upsert.mockResolvedValueOnce({ error: { message: 'duplicate key' } })
    doble.eq.mockResolvedValueOnce({ error: { message: 'network error' } })

    await expect(crearTrabajador({ ...VALUES_BASE, fincaId: 'birrisito' }, doble.client)).rejects.toThrow('no se pudo revertir')
  })

  // el capataz no puede hacer nada con el texto crudo de Postgres
  it('traduce la cedula duplicada a un mensaje que el capataz entiende', async () => {
    const doble = clienteDosTablas()
    doble.upsert.mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key value violates unique constraint "datos_trabajadores_finca_cedula_idx"' } })

    await expect(crearTrabajador({ ...VALUES_BASE, cedula: '1-1111-1111', fincaId: 'birrisito' }, doble.client)).rejects.toThrow('Esa cédula ya está registrada en otro trabajador de la finca.')
  })
})
