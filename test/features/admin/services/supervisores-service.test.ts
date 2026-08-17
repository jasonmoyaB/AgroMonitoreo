import { FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { actualizarSupervisor, invitarUsuario } from '../../../../src/features/admin/services/supervisores-service'

// leerMensajeFuncion es privada: se ejerce por la puerta publica, que es la que
// decide el mensaje que ve el admin cuando la edge function falla.
function clienteFuncion(error: Error | null = null) {
  const invoke = vi.fn(() => Promise.resolve({ data: null, error }))

  return { client: { functions: { invoke } } as unknown as SupabaseClient, invoke }
}

// FunctionsHttpError espera un Response; solo se le lee .json().
function errorHttp(cuerpo: unknown, mensaje = 'Edge Function returned a non-2xx status code'): Error {
  const context = { json: () => (cuerpo instanceof Error ? Promise.reject(cuerpo) : Promise.resolve(cuerpo)) }
  const error = new FunctionsHttpError(context as unknown as Response)
  error.message = mensaje

  return error
}

describe('invitarUsuario', () => {
  it('normaliza el correo antes de mandarlo a la funcion', async () => {
    const { client, invoke } = clienteFuncion()

    await invitarUsuario('  Nuevo@Ejemplo.COM ', client)

    expect(invoke).toHaveBeenCalledWith('invitar-usuario', { body: { email: 'nuevo@ejemplo.com' } })
  })

  it('no lanza cuando la funcion responde ok', async () => {
    const { client } = clienteFuncion()

    await expect(invitarUsuario('nuevo@ejemplo.com', client)).resolves.toBeUndefined()
  })

  // el caso que motiva leerMensajeFuncion: invoke() no lee el cuerpo si el status no es
  // 2xx, asi que sin esto el admin ve "non-2xx status code" en vez de la causa real.
  it('saca el mensaje real del cuerpo cuando la funcion responde con status de error', async () => {
    const { client } = clienteFuncion(errorHttp({ error: 'Ese correo ya tiene cuenta.' }))

    await expect(invitarUsuario('repetido@ejemplo.com', client)).rejects.toThrow('invitarUsuario: Ese correo ya tiene cuenta.')
  })

  it('cae al mensaje del error si el cuerpo no trae error string', async () => {
    const { client } = clienteFuncion(errorHttp({ ok: false }, 'Edge Function returned a non-2xx status code'))

    await expect(invitarUsuario('x@ejemplo.com', client)).rejects.toThrow('invitarUsuario: Edge Function returned a non-2xx status code')
  })

  // un 500 sin headers CORS llega con cuerpo ilegible: no puede tumbar la pantalla.
  it('cae al mensaje del error si el cuerpo no es JSON', async () => {
    const { client } = clienteFuncion(errorHttp(new Error('Unexpected token < in JSON'), 'Edge Function returned a non-2xx status code'))

    await expect(invitarUsuario('x@ejemplo.com', client)).rejects.toThrow('invitarUsuario: Edge Function returned a non-2xx status code')
  })

  // un fallo de red no es FunctionsHttpError y no tiene .context: leerlo reventaria.
  it('usa el mensaje tal cual cuando el error no es de status HTTP', async () => {
    const { client } = clienteFuncion(new Error('Failed to send a request to the Edge Function'))

    await expect(invitarUsuario('x@ejemplo.com', client)).rejects.toThrow('invitarUsuario: Failed to send a request to the Edge Function')
  })
})

// dos tablas en la misma llamada: roles para resolver el id del rol, usuario para escribir.
function clienteActualizar(fila: Record<string, unknown>) {
  const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: fila, error: null }) }) }) }))
  const select = () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'rol-supervisor' }, error: null }) }) })
  const from = vi.fn((tabla: string) => (tabla === 'roles' ? { select } : { update }))

  return { client: { from } as unknown as SupabaseClient, update }
}

function filaSupervisor(fincaId: string | null, finca: { nombre: string } | null) {
  return { id: 'u-1', email: 'nuevo@ejemplo.com', nombre: 'Nuevo', activo: true, finca_id: fincaId, finca, rol: { nombre: 'supervisor' } }
}

describe('actualizarSupervisor', () => {
  it('asigna la finca que eligio el admin', async () => {
    const { client, update } = clienteActualizar(filaSupervisor('birrisito', { nombre: 'Birrisito' }))

    const supervisor = await actualizarSupervisor({ id: 'u-1', nombre: 'Nuevo', rol: 'supervisor', fincaId: 'birrisito' }, client)

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ finca_id: 'birrisito' }))
    expect(supervisor.fincaNombre).toBe('Birrisito')
  })

  // el invitado nace sin finca: guardar el resto de sus datos no puede inventarle una.
  // Si esto mandara '' en vez de null, el FK contra fincas reventaria el guardado.
  it('manda finca_id null cuando el admin todavia no le asigna finca', async () => {
    const { client, update } = clienteActualizar(filaSupervisor(null, null))

    await actualizarSupervisor({ id: 'u-1', nombre: 'Nuevo', rol: 'supervisor', fincaId: null }, client)

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ finca_id: null }))
  })

  // sin FK el embed a fincas vuelve null: fincaNombre no puede caer al finca_id, que
  // tambien es null. La tabla del admin usa ese null para pintar "Sin finca".
  it('deja fincaNombre en null cuando la fila no tiene finca', async () => {
    const { client } = clienteActualizar(filaSupervisor(null, null))

    const supervisor = await actualizarSupervisor({ id: 'u-1', nombre: 'Nuevo', rol: 'supervisor', fincaId: null }, client)

    expect(supervisor.fincaId).toBeNull()
    expect(supervisor.fincaNombre).toBeNull()
  })
})
