import { useUsuarioActual } from './use-usuario-actual'

export interface PerfilSidebar {
  nombre: string | null
  email: string
  fincaNombre: string
  organizacionNombre: string | null
}

export function usePerfilSidebar(): PerfilSidebar | null {
  const { usuario } = useUsuarioActual()
  if (!usuario) return null

  // el admin sin finca propia igual ve el sidebar; la etiqueta es display, no dato
  // organizacionNombre viaja dentro de PerfilSidebar y no como prop nueva de AdminSidebar:
  // ese componente ya esta en el tope de 5 props que fija convenciones.md.
  return {
    nombre: usuario.nombre,
    email: usuario.email,
    fincaNombre: usuario.fincaNombre ?? 'Sin finca',
    organizacionNombre: usuario.organizacionNombre,
  }
}
