import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '../hooks/use-auth-session'
import { useUsuarioActual } from '../hooks/use-usuario-actual'

interface RouteGuardProps {
  soloAdmin?: boolean
}

export function RouteGuard({ soloAdmin = false }: RouteGuardProps) {
  const { session, isLoading: isLoadingSession } = useAuthSession()
  const { usuario, isLoading: isLoadingUsuario } = useUsuarioActual(!!session)

  if (isLoadingSession || (session && isLoadingUsuario)) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p className="neu-raised rounded-3xl px-6 py-5 text-lg font-black text-green-900">Preparando acceso...</p>
      </main>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  const esAdmin = usuario?.rol === 'admin_oficina'
  if (soloAdmin && !esAdmin) return <Navigate to="/supervisor" replace />
  if (!soloAdmin && esAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}
