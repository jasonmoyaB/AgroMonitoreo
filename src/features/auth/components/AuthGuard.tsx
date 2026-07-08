import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '../hooks/use-auth-session'

export function AuthGuard() {
  const { session, isLoading } = useAuthSession()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p className="neu-raised rounded-3xl px-6 py-5 text-lg font-black text-green-900">Preparando acceso...</p>
      </main>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}
