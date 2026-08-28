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
    organizacionNombre: 'Organizacion Birrisito',
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

  // Defensa en profundidad, no un bug vivo: con throwOnError en App.tsx un perfil que no
  // carga lanza y lo atiende RouteErrorScreen, asi que este estado no llega desde la app.
  // El test fija que el default de la funcion pura sea frenar y no dejar pasar.
  it('frena tambien cuando el perfil no cargo', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: undefined })).toBe('sin-finca')
  })

  it('saca al supervisor de las rutas de admin', () => {
    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: usuario() })).toBe('a-supervisor')
  })

  it('saca al admin de las rutas de supervisor', () => {
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: usuario({ rol: 'admin_oficina' }) })).toBe('a-admin')
  })

  // el camino que probaria alguien de afuera: invitado sin finca apuntando a /admin/*.
  // Sale a /supervisor, donde la misma funcion lo manda a 'sin-finca'. No hay loop:
  // 'a-supervisor' solo se devuelve en rutas soloAdmin, y /supervisor no lo es.
  it('saca de las rutas de admin al supervisor sin finca', () => {
    const sinFinca = usuario({ fincaId: null, fincaNombre: null })

    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: sinFinca })).toBe('a-supervisor')
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: sinFinca })).toBe('sin-finca')
  })

  // el admin cruza fincas a mano en cada pantalla: no necesita finca propia para entrar.
  // Las dos rutas importan: `/` redirige a /supervisor, asi que un admin sin finca
  // propia entra por ahi y tiene que rebotar a /admin, no quedarse en 'sin-finca'.
  it('deja pasar al admin sin finca propia y lo rebota desde las rutas de supervisor', () => {
    const admin = usuario({ rol: 'admin_oficina', fincaId: null, fincaNombre: null })

    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: admin })).toBe('permitido')
    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: admin })).toBe('a-admin')
  })

  // sin organizacion la RLS no devuelve una sola fila: el shell se pintaria entero en cero
  // y sin explicacion. Alcanza al admin, que no depende de finca propia pero si de su
  // empresa. No deberia pasar por el flujo normal (invitar-usuario deshace el alta si no
  // logra estampar la organizacion); es defensa contra un alta hecha a mano por SQL.
  it('frena a cualquiera sin organizacion, incluido el admin', () => {
    const supervisorSinOrg = usuario({ organizacionNombre: null })
    const adminSinOrg = usuario({ rol: 'admin_oficina', fincaId: null, fincaNombre: null, organizacionNombre: null })

    expect(decidirAccesoRuta({ ...RUTA_SUPERVISOR, usuario: supervisorSinOrg })).toBe('sin-finca')
    expect(decidirAccesoRuta({ ...RUTA_ADMIN, usuario: adminSinOrg })).toBe('sin-finca')
  })
})
