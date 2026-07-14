import { CalendarDays, MapPin, User } from 'lucide-react'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { LaborTaskList } from '../components/LaborTaskList'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'

export function SupervisorDashboardScreen() {
  const dashboard = useSupervisorDashboard()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <SupervisorSidebar
          isCollapsed={dashboard.isSidebarCollapsed}
          isSigningOut={isSigningOut}
          perfil={perfil}
          onToggle={dashboard.toggleSidebar}
          onSignOut={handleCerrarSesion}
        />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-3 rounded-[2rem] p-4 sm:mb-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Supervisor</p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-green-800" aria-hidden="true" />
                  {perfil?.nombre ?? perfil?.email ?? '...'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-green-800" aria-hidden="true" />
                  {perfil?.fincaNombre ?? '...'}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Labores por hacer</h1>
                <p className="mt-2 max-w-2xl text-base font-bold leading-7 text-slate-600">
                  Elige una labor y registra trabajadores. Menos pasos, más campo.
                </p>
              </div>
              <span className="neu-pressed flex min-h-14 items-center justify-center gap-2 rounded-2xl px-4 font-black capitalize text-slate-700">
                <CalendarDays className="h-5 w-5 shrink-0 text-green-800" aria-hidden="true" />
                {dashboard.fechaHoy}
              </span>
            </div>
          </header>

          <LaborTaskList labores={dashboard.laboresPendientes} onSelect={dashboard.seleccionarLaborPendiente} />
        </section>
      </div>
    </main>
  )
}
