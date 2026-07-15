import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useUsuarioActual } from '../../auth/hooks/use-usuario-actual'
import { CambiarPasswordForm, EditarNombreForm } from '../../perfil'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'

export function ConfiguracionScreen() {
  const dashboard = useAdminDashboard()
  const perfil = usePerfilSidebar()
  const { usuario, isLoading } = useUsuarioActual()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Cuenta</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Configuración</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Edita tu nombre y tu contraseña de acceso.</p>
          </header>

          {isLoading || !usuario ? (
            <p className="font-bold text-slate-600">Cargando datos...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <EditarNombreForm usuario={usuario} />
              <CambiarPasswordForm />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
