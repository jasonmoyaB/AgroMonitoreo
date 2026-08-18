import type { Usuario } from '../../../shared/types/domain.types'

export type AccesoRuta = 'cargando' | 'a-login' | 'a-admin' | 'a-supervisor' | 'sin-finca' | 'permitido'

interface DecidirAccesoRutaInput {
  isLoading: boolean
  sesionActiva: boolean
  usuario: Usuario | undefined
  soloAdmin: boolean
}

// Quien entra a donde. Vive aparte de RouteGuard porque son ramas de seguridad y asi
// tienen test: el componente solo traduce el resultado a JSX.
export function decidirAccesoRuta({ isLoading, sesionActiva, usuario, soloAdmin }: DecidirAccesoRutaInput): AccesoRuta {
  if (isLoading) return 'cargando'
  if (!sesionActiva) return 'a-login'

  const esAdmin = usuario?.rol === 'admin_oficina'
  if (soloAdmin && !esAdmin) return 'a-supervisor'
  if (!soloAdmin && esAdmin) return 'a-admin'

  // El admin nunca cae aca: si era admin en ruta de supervisor ya se fue a /admin, y en
  // ruta de admin no depende de finca propia (elige la finca a mano en cada pantalla).
  //
  // `!usuario?.fincaId` deja la funcion total: sin perfil tampoco hay finca que valga.
  //
  // En la app ese caso no llega hasta aca — App.tsx pone throwOnError: true, asi que si
  // obtenerUsuarioActual falla (red caida, o usuario desactivado, que pierde su propia
  // fila por el `activo = true` de usuario_select_own) la query lanza y lo atiende el
  // errorElement RouteErrorScreen, que ademas distingue el caso offline. Es defensa en
  // profundidad, no el arreglo de un bug vivo: si alguien saca throwOnError, el default
  // sigue siendo frenar en vez de pintar el shell de supervisor vacio.
  if (!soloAdmin && !usuario?.fincaId) return 'sin-finca'

  return 'permitido'
}
