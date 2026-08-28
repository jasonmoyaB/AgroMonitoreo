import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  listarMisTraslados,
  listarTrabajadoresPrestadosHoy,
  listarTrabajadoresTrasladadosHoy,
} from '../../../../src/features/traslados/services/traslados-service'
import type { EstadoTraslado } from '../../../../src/features/traslados/types/traslado.types'

interface RespuestaSupabase {
  data?: unknown
  error?: { message: string } | null
}

interface Cadena {
  select: (...args: unknown[]) => Cadena
  eq: (...args: unknown[]) => Cadena
  or: (...args: unknown[]) => Cadena
  returns: () => Promise<{ data: unknown; error: { message: string } | null }>
}


// El bucket es privado: los services de lectura firman las fotos en lote antes de devolver.
// El doble devuelve una firma predecible para poder afirmar sobre ella.
const storage = {
  from: () => ({
    createSignedUrls: (rutas: string[]) =>
      Promise.resolve({ data: rutas.map((path) => ({ path, signedUrl: `firmada://${path}`, error: null })), error: null }),
  }),
}

// cada .from() consume la siguiente respuesta de la cola: listarMisTraslados dispara dos
// consultas (origen primero, destino despues) y cada una tiene que poder devolver lo suyo
function clienteLectura(...respuestas: RespuestaSupabase[]) {
  const select = vi.fn()
  const eq = vi.fn()
  const or = vi.fn()
  let consultas = 0

  const from = vi.fn(() => {
    const respuesta = respuestas[consultas] ?? {}
    consultas += 1
    const cadena: Cadena = {
      select: (...args: unknown[]) => {
        select(...args)
        return cadena
      },
      eq: (...args: unknown[]) => {
        eq(...args)
        return cadena
      },
      or: (...args: unknown[]) => {
        or(...args)
        return cadena
      },
      returns: () => Promise.resolve({ data: respuesta.data ?? null, error: respuesta.error ?? null }),
    }
    return cadena
  })

  return { client: { from, storage } as unknown as SupabaseClient, from, select, eq, or }
}

interface FilaTraslado {
  id: string
  trabajador_id: string
  fecha: string
  estado: EstadoTraslado
  finca_origen_id: string
  finca_destino_id: string
  trabajador: { nombre_completo: string } | null
  finca_origen: { nombre: string } | null
  finca_destino: { nombre: string } | null
}

function crearFilaTraslado(overrides: Partial<FilaTraslado> = {}): FilaTraslado {
  return {
    id: 'tr1',
    trabajador_id: 't1',
    fecha: '2026-07-20',
    estado: 'aprobado',
    finca_origen_id: 'birrisito',
    finca_destino_id: 'la-flor',
    trabajador: { nombre_completo: 'Alvin Alcantara' },
    finca_origen: { nombre: 'Birrisito' },
    finca_destino: { nombre: 'La Flor' },
    ...overrides,
  }
}

interface FilaPrestado {
  trabajador: { id: string; finca_id: string; nombre_completo: string; foto_url: string | null; activo: boolean } | null
  finca_origen: { nombre: string } | null
}

function crearFilaPrestado(overrides: Partial<FilaPrestado> = {}): FilaPrestado {
  return {
    trabajador: { id: 't1', finca_id: 'la-flor', nombre_completo: 'Alvin Alcantara', foto_url: 'foto.jpg', activo: true },
    finca_origen: { nombre: 'La Flor' },
    ...overrides,
  }
}

describe('listarMisTraslados', () => {
  it('junta los dos lados y los ordena por fecha descendente', async () => {
    const { client } = clienteLectura(
      { data: [crearFilaTraslado({ id: 'origen-viejo', fecha: '2026-07-20' })] },
      { data: [crearFilaTraslado({ id: 'destino-nuevo', fecha: '2026-08-02' }), crearFilaTraslado({ id: 'destino-medio', fecha: '2026-07-28' })] }
    )

    const traslados = await listarMisTraslados('birrisito', client)

    expect(traslados[0].id).toBe('destino-nuevo')
    expect(traslados[1].id).toBe('destino-medio')
    expect(traslados[2].id).toBe('origen-viejo')
  })

  it('consulta el lado origen y el lado destino en dos queries separadas', async () => {
    const { client, from, eq } = clienteLectura({ data: [] }, { data: [] })

    await listarMisTraslados('birrisito', client)

    expect(from).toHaveBeenCalledTimes(2)
    expect(eq).toHaveBeenCalledWith('finca_origen_id', 'birrisito')
    expect(eq).toHaveBeenCalledWith('finca_destino_id', 'birrisito')
  })

  // .or() recibe un string de filtro y no acepta parametros, asi que el fincaId terminaba
  // interpolado sin escapar dentro de la consulta. volver a .or() es la regresion a evitar
  it('no usa .or(): ese filtro interpola el id de finca sin escapar', async () => {
    const { client, or } = clienteLectura({ data: [] }, { data: [] })

    await listarMisTraslados('birrisito', client)

    expect(or).not.toHaveBeenCalled()
  })

  it('mapea la fila con los nombres de finca y de trabajador del embed', async () => {
    const { client } = clienteLectura({ data: [crearFilaTraslado()] }, { data: [] })

    const [traslado] = await listarMisTraslados('birrisito', client)

    expect(traslado).toEqual({
      id: 'tr1',
      trabajadorId: 't1',
      trabajadorNombre: 'Alvin Alcantara',
      fincaOrigenId: 'birrisito',
      fincaOrigenNombre: 'Birrisito',
      fincaDestinoId: 'la-flor',
      fincaDestinoNombre: 'La Flor',
      fecha: '2026-07-20',
      estado: 'aprobado',
    })
  })

  // los embeds vienen en null cuando RLS no alcanza la fila referenciada: la lista tiene
  // que seguir pintando algo en la celda, no "undefined"
  it('sin embed de fincas cae al id de cada finca en vez de dejar el nombre vacio', async () => {
    const { client } = clienteLectura({ data: [crearFilaTraslado({ finca_origen: null, finca_destino: null })] }, { data: [] })

    const [traslado] = await listarMisTraslados('birrisito', client)

    expect(traslado.fincaOrigenNombre).toBe('birrisito')
    expect(traslado.fincaDestinoNombre).toBe('la-flor')
  })

  it('sin embed de trabajador el nombre queda en cadena vacia', async () => {
    const { client } = clienteLectura({ data: [crearFilaTraslado({ trabajador: null })] }, { data: [] })

    const [traslado] = await listarMisTraslados('birrisito', client)

    expect(traslado.trabajadorNombre).toBe('')
  })

  it('propaga el error del lado destino, no solo el del lado origen', async () => {
    const { client } = clienteLectura({ data: [] }, { error: { message: 'permission denied' } })

    await expect(listarMisTraslados('birrisito', client)).rejects.toThrow('listarMisTraslados: permission denied')
  })
})

describe('listarTrabajadoresPrestadosHoy', () => {
  it('mapea al trabajador prestado con el nombre de la finca que lo presto', async () => {
    const { client } = clienteLectura({ data: [crearFilaPrestado()] })

    expect(await listarTrabajadoresPrestadosHoy('birrisito', '2026-08-03', client)).toEqual([
      { id: 't1', fincaId: 'la-flor', nombreCompleto: 'Alvin Alcantara', fotoUrl: 'firmada://foto.jpg', activo: true, fincaOrigenNombre: 'La Flor' },
    ])
  })

  // el embed llega en null cuando RLS no alcanza al trabajador. sin el filtro, el .map()
  // revienta leyendo row.trabajador.id y la pantalla de trabajadores queda en blanco
  it('descarta la fila cuyo trabajador vino en null en vez de reventar', async () => {
    const { client } = clienteLectura({
      data: [crearFilaPrestado({ trabajador: null }), crearFilaPrestado()],
    })

    const prestados = await listarTrabajadoresPrestadosHoy('birrisito', '2026-08-03', client)

    expect(prestados).toHaveLength(1)
    expect(prestados[0].id).toBe('t1')
  })

  it('sin embed de finca origen cae al finca_id del trabajador', async () => {
    const { client } = clienteLectura({ data: [crearFilaPrestado({ finca_origen: null })] })

    const [prestado] = await listarTrabajadoresPrestadosHoy('birrisito', '2026-08-03', client)

    expect(prestado.fincaOrigenNombre).toBe('la-flor')
  })

  // el prestamo dura un dia y vence por scoping de fecha, no por una accion de devolucion:
  // si se cae el .eq('fecha'), un trabajador prestado la semana pasada sigue apareciendo hoy
  it('trae solo los aprobados de esa finca destino y de esa fecha', async () => {
    const { client, from, eq } = clienteLectura({ data: [] })

    await listarTrabajadoresPrestadosHoy('birrisito', '2026-08-03', client)

    expect(from).toHaveBeenCalledWith('traslados_trabajadores')
    expect(eq).toHaveBeenCalledWith('finca_destino_id', 'birrisito')
    expect(eq).toHaveBeenCalledWith('fecha', '2026-08-03')
    expect(eq).toHaveBeenCalledWith('estado', 'aprobado')
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteLectura({ error: { message: 'permission denied' } })

    await expect(listarTrabajadoresPrestadosHoy('birrisito', '2026-08-03', client)).rejects.toThrow('listarTrabajadoresPrestadosHoy: permission denied')
  })
})

// el lado espejo de prestadosHoy: mismo traslado visto desde la finca que presta
describe('listarTrabajadoresTrasladadosHoy', () => {
  it('mapea al trabajador con el nombre de la finca a la que se fue', async () => {
    const { client } = clienteLectura({
      data: [{ trabajador_id: 't1', finca_destino_id: 'la-flor', finca_destino: { nombre: 'La Flor' } }],
    })

    expect(await listarTrabajadoresTrasladadosHoy('birrisito', '2026-08-03', client)).toEqual([
      { trabajadorId: 't1', fincaDestinoNombre: 'La Flor' },
    ])
  })

  // sin el fallback el badge del lado origen dice "A undefined"
  it('sin embed de finca destino cae al id de la finca', async () => {
    const { client } = clienteLectura({ data: [{ trabajador_id: 't1', finca_destino_id: 'la-flor', finca_destino: null }] })

    const [trasladado] = await listarTrabajadoresTrasladadosHoy('birrisito', '2026-08-03', client)

    expect(trasladado.fincaDestinoNombre).toBe('la-flor')
  })

  // si se cae el .eq('fecha'), el supervisor no puede seleccionar hoy a un trabajador que
  // presto la semana pasada, porque sigue apareciendo bloqueado
  it('trae solo los aprobados de esa finca origen y de esa fecha', async () => {
    const { client, from, eq } = clienteLectura({ data: [] })

    await listarTrabajadoresTrasladadosHoy('birrisito', '2026-08-03', client)

    expect(from).toHaveBeenCalledWith('traslados_trabajadores')
    expect(eq).toHaveBeenCalledWith('finca_origen_id', 'birrisito')
    expect(eq).toHaveBeenCalledWith('fecha', '2026-08-03')
    expect(eq).toHaveBeenCalledWith('estado', 'aprobado')
  })

  it('propaga el error de supabase como excepcion', async () => {
    const { client } = clienteLectura({ error: { message: 'permission denied' } })

    await expect(listarTrabajadoresTrasladadosHoy('birrisito', '2026-08-03', client)).rejects.toThrow(
      'listarTrabajadoresTrasladadosHoy: permission denied'
    )
  })
})
