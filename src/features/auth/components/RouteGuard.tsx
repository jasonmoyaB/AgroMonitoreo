import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '../hooks/use-auth-session'
import { useUsuarioActual } from '../hooks/use-usuario-actual'
import { decidirAccesoRuta } from '../utils/decidir-acceso-ruta'
import { SinFincaAsignada } from './SinFincaAsignada'

interface RouteGuardProps {
  soloAdmin?: boolean
}

export function RouteGuard({ soloAdmin = false }: RouteGuardProps) {
  const { session, isLoading: isLoadingSession } = useAuthSession()
  const { usuario, isLoading: isLoadingUsuario } = useUsuarioActual(!!session)

  const acceso = decidirAccesoRuta({
    isLoading: isLoadingSession || (!!session && isLoadingUsuario),
    sesionActiva: !!session,
    usuario,
    soloAdmin,
  })

  if (acceso === 'cargando') {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p className="neu-raised rounded-3xl px-6 py-5 text-lg font-black text-green-900">Preparando acceso...</p>
      </main>
    )
  }

  if (acceso === 'a-login') return <Navigate to="/login" replace />
  if (acceso === 'a-admin') return <Navigate to="/admin" replace />
  if (acceso === 'a-supervisor') return <Navigate to="/supervisor" replace />
  if (acceso === 'sin-finca') return <SinFincaAsignada />

  return <Outlet />
}
