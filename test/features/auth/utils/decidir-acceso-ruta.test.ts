import { describe, expect, it } from 'vitest'
import { decidirAccesoRuta } from '../../../../src/features/auth/utils/decidir-acceso-ruta'
import type { Usuario } from '../../../../src/shared/types/domain.types'

function usuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: 'u-1',
    email: 'capataz@ejemplo.com',
    nombre: 'Capataz',
    fincaId: 'birrisito',
    fincaNombre: 'Birrisito',
    activo: true,
    rol: 'supervisor',
    ...overrides,
  }
}

const RUTA_SUPERVISOR = { isLoading: false, sesionActiva: true, soloAdmin: false }
const RUTA_ADMIN = { isLoading: false, sesionActiva: true, soloAdmin: true }

describe('decidirAccesoRuta', () => {
  it('espera antes de decidir mientras carga', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, isLoading: true, usuario: undefined })).toBe('cargando')
  })

  it('manda a login sin sesion', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, sesionActiva: false, usuario: undefined })).toBe('a-login')
  })

  it('deja pasar al supervisor con finca', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: usuario() })).toBe('permitido')
  })

  // el caso que motiva todo: el invitado nace sin finca y no puede ver el shell vacio.
  it('frena al supervisor sin finca', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: usuario({ fincaId: null, fincaNombre: null }) })).toBe('sin-finca')
  })

  // apenas el admin le asigna la finca, la misma decision lo deja entrar sin nada mas.
  it('deja pasar al mismo supervisor apenas le asignan la finca', () => {
    const recienAsignado = usuario({ fincaId: 'orosi-purisil', fincaNombre: 'Orosi - Purisil' })

    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: recienAsignado })).toBe('permitido')
  })

  // sin perfil cargado no hay finca que valga: con `usuario && !usuario.fincaId` esto
  // caia en 'permitido' y pintaba el shell de supervisor vacio.
  it('frena tambien cuando el perfil no cargo', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: undefined })).toBe('sin-finca')
  })

  it('saca al supervisor de las rutas de admin', () => {
    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: usuario() })).toBe('a-supervisor')
  })

  it('saca al admin de las rutas de supervisor', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: usuario({ rol: 'admin_oficina' }) })).toBe('a-admin')
  })

  // el admin cruza fincas a mano en cada pantalla: no necesita finca propia para entrar.
  it('deja pasar al admin sin finca propia', () => {
    const admin = usuario({ rol: 'admin_oficina', fincaId: null, fincaNombre: null })

    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: admin })).toBe('permitido')
  })
})
