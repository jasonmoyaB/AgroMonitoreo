import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useResolverTraslados } from '../../traslados/hooks/use-resolver-traslados'
import { useHistorialTraslados } from '../../traslados/hooks/use-historial-traslados'
import { TrasladosPendientesTable } from '../../traslados/components/TrasladosPendientesTable'
import { TrasladosHistorialTable } from '../../traslados/components/TrasladosHistorialTable'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'

export function TrasladosAdminScreen() {
  const dashboard = useAdminDashboard()
  const perfil = usePerfilSidebar()
  const traslados = useResolverTraslados()
  const historial = useHistorialTraslados()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Traslados de trabajadores</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Solicitudes de préstamo de trabajadores entre fincas, pendientes de aprobación.</p>
          </header>

          <TrasladosPendientesTable
            pendientes={traslados.pendientes}
            isLoading={traslados.isLoading}
            resolviendoId={traslados.resolviendoId}
            onAprobar={traslados.aprobar}
            onRechazar={traslados.rechazar}
          />

          <h2 className="mb-3 mt-6 text-xl font-black text-slate-900">Historial de traspasos</h2>
          <TrasladosHistorialTable historial={historial.historial} isLoading={historial.isLoading} />
        </section>
      </div>
    </main>
  )
}
