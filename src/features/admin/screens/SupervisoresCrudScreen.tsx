import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { Modal } from '../../../shared/components/Modal'
import { AdminSidebar } from '../components/AdminSidebar'
import { SupervisorForm } from '../components/SupervisorForm'
import { SupervisoresTable } from '../components/SupervisoresTable'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'
import { useSupervisoresCrud } from '../hooks/use-supervisores-crud'

export function SupervisoresCrudScreen() {
  const dashboard = useAdminDashboard()
  const supervisores = useSupervisoresCrud()
  const { fincas } = useFincas()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[2rem] p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Supervisores</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Usuarios registrados. Asigna su finca y rol.</p>
            </div>
          </header>

          <SupervisoresTable supervisores={supervisores.supervisores} isLoading={supervisores.isLoading} onEdit={supervisores.onOpenEdit} onToggleActive={supervisores.alternarEstado} />
        </section>

        <Modal isOpen={supervisores.isFormOpen} title="Editar supervisor" onClose={supervisores.onCloseForm}>
          <SupervisorForm
            state={{ values: supervisores.values, error: supervisores.error, isSubmitting: supervisores.isSubmitting }}
            actions={{ onFieldChange: supervisores.updateField, onSubmit: supervisores.handleSubmit }}
            fincas={fincas}
          />
        </Modal>
      </div>
    </main>
  )
}
