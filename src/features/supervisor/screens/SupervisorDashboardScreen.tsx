import { CalendarDays } from 'lucide-react'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { LaborTaskList } from '../components/LaborTaskList'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'

export function SupervisorDashboardScreen() {
  const dashboard = useSupervisorDashboard()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <SupervisorSidebar
          isCollapsed={dashboard.isSidebarCollapsed}
          isSigningOut={isSigningOut}
          onToggle={dashboard.toggleSidebar}
          onSignOut={handleCerrarSesion}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <header className="neu-raised shrink-0 rounded-[2rem] p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Supervisor</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Labores por hacer</h1>
                <p className="mt-2 max-w-2xl text-base font-bold leading-7 text-slate-600">
                  Elige una labor y registra trabajadores. Menos pasos, más campo.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <span className="neu-pressed flex min-h-14 items-center justify-center gap-2 rounded-2xl px-4 font-black capitalize text-slate-700">
                  <CalendarDays className="h-5 w-5 text-green-800" aria-hidden="true" />
                  {dashboard.fechaHoy}
                </span>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <LaborTaskList labores={dashboard.laboresPendientes} onSelect={dashboard.seleccionarLaborPendiente} />
          </div>
        </section>
      </div>
    </main>
  )
}
