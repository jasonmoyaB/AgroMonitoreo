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
  // `!usuario?.fincaId` y no `usuario && !usuario.fincaId`: si el perfil no cargo tampoco
  // hay finca que valga, y dejarlo pasar pinta el shell de supervisor vacio.
  if (!soloAdmin && !usuario?.fincaId) return 'sin-finca'

  return 'permitido'
}
