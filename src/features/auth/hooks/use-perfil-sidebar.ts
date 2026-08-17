import { useUsuarioActual } from './use-usuario-actual'

export interface PerfilSidebar {
  nombre: string | null
  email: string
  fincaNombre: string
}

export function usePerfilSidebar(): PerfilSidebar | null {
  const { usuario } = useUsuarioActual()
  if (!usuario) return null

  // el admin sin finca propia igual ve el sidebar; la etiqueta es display, no dato
  return { nombre: usuario.nombre, email: usuario.email, fincaNombre: usuario.fincaNombre ?? 'Sin finca' }
}
