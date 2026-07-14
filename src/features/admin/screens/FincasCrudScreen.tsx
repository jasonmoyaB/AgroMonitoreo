import { Warehouse } from 'lucide-react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { Modal } from '../../../shared/components/Modal'
import { AdminSidebar } from '../components/AdminSidebar'
import { FincaForm } from '../components/FincaForm'
import { FincasTable } from '../components/FincasTable'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincasCrud } from '../hooks/use-fincas-crud'

export function FincasCrudScreen() {
  const dashboard = useAdminDashboard()
  const fincas = useFincasCrud()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[2rem] p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Fincas</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Agrega nuevas fincas o desactiva las que ya no operan.</p>
            </div>
            <button
              type="button"
              onClick={fincas.onOpenCreate}
              className="flex min-h-14 shrink-0 cursor-pointer items-center gap-2 rounded-2xl bg-green-700 px-5 font-black text-white shadow-lg shadow-green-900/20"
            >
              <Warehouse className="h-5 w-5" aria-hidden="true" />
              Agregar finca
            </button>
          </header>

          <FincasTable fincas={fincas.fincas} isLoading={fincas.isLoading} onToggleActive={fincas.alternarEstado} />
        </section>

        <Modal isOpen={fincas.isFormOpen} title="Agregar finca" onClose={fincas.onCloseForm}>
          <FincaForm values={fincas.values} error={fincas.error} isSubmitting={fincas.isSubmitting} onFieldChange={fincas.updateField} onSubmit={fincas.handleSubmit} />
        </Modal>
      </div>
    </main>
  )
}
