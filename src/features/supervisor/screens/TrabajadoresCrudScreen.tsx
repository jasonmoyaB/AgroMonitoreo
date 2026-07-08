import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { useTrabajadoresCrud } from '../../trabajadores/hooks/use-trabajadores-crud'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { TrabajadorForm } from '../components/TrabajadorForm'
import { TrabajadoresList } from '../components/TrabajadoresList'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'

export function TrabajadoresCrudScreen() {
  const dashboard = useSupervisorDashboard()
  const trabajadores = useTrabajadoresCrud()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <SupervisorSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="grid min-h-0 min-w-0 flex-1 gap-4 overflow-y-auto overscroll-contain lg:grid-cols-[1fr_24rem]">
          <div className="min-w-0">
            <header className="neu-raised mb-4 rounded-[2rem] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">{trabajadores.finca.nombre}</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Trabajadores</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Edita, activa o inactiva trabajadores registrados.</p>
            </header>
            <TrabajadoresList trabajadores={trabajadores.trabajadores} isLoading={trabajadores.isLoading} onEdit={trabajadores.editarTrabajador} onToggleActive={trabajadores.alternarEstado} />
          </div>

          <TrabajadorForm state={trabajadores} actions={{ onFieldChange: trabajadores.updateField, onSubmit: trabajadores.handleSubmit, onCreateNew: trabajadores.crearNuevo }} />
        </section>
      </div>
    </main>
  )
}
