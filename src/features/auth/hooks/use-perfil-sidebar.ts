import { useUsuarioActual } from './use-usuario-actual'

export interface PerfilSidebar {
  nombre: string | null
  email: string
  fincaNombre: string
}

export function usePerfilSidebar(): PerfilSidebar | null {
  const { usuario } = useUsuarioActual()
  if (!usuario) return null

  return { nombre: usuario.nombre, email: usuario.email, fincaNombre: usuario.fincaNombre }
}
