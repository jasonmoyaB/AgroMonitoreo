import { AgregarTrabajadorForm } from '../components/AgregarTrabajadorForm'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { useAgregarTrabajador } from '../../trabajadores'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'

export function AgregarTrabajadorScreen() {
  const dashboard = useSupervisorDashboard()
  const trabajador = useAgregarTrabajador()
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

        <section className="flex min-h-0 min-w-0 flex-1 justify-center overflow-y-auto overscroll-contain py-1">
          <AgregarTrabajadorForm
            state={trabajador}
            actions={{ onFieldChange: trabajador.updateField, onSubmit: trabajador.handleSubmit }}
          />
        </section>
      </div>
    </main>
  )
}
