import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { Modal } from '../../../shared/components/Modal'
import { AdminSidebar } from '../components/AdminSidebar'
import { InvitarUsuarioForm } from '../components/InvitarUsuarioForm'
import { SupervisorForm } from '../components/SupervisorForm'
import { SupervisoresTable } from '../components/SupervisoresTable'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'
import { useInvitarUsuario } from '../hooks/use-invitar-usuario'
import { useSupervisoresCrud } from '../hooks/use-supervisores-crud'

export function SupervisoresCrudScreen() {
  const dashboard = useAdminDashboard()
  const supervisores = useSupervisoresCrud()
  const invitacion = useInvitarUsuario()
  const { fincas } = useFincas()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()
  const [fincaFiltroId, setFincaFiltroId] = useState('')
  const visibles = fincaFiltroId ? supervisores.supervisores.filter((supervisor) => supervisor.fincaId === fincaFiltroId) : supervisores.supervisores

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[2rem] p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Supervisores</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Usuarios registrados. Asigna su finca y rol.</p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <button
                type="button"
                onClick={invitacion.abrir}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-green-700 px-4 text-sm font-black text-white shadow-lg shadow-green-900/20 transition-colors duration-200 hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Invitar
              </button>

              <label className="flex flex-col gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Finca
                <select
                  value={fincaFiltroId}
                  onChange={(event) => setFincaFiltroId(event.target.value)}
                  className="neu-pressed min-h-11 rounded-2xl px-4 text-sm font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
                >
                  <option value="">Todas</option>
                  {fincas.map((finca) => (
                    <option key={finca.id} value={finca.id}>
                      {finca.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <SupervisoresTable supervisores={visibles} isLoading={supervisores.isLoading} onEdit={supervisores.onOpenEdit} onToggleActive={supervisores.alternarEstado} />
        </section>

        <Modal isOpen={supervisores.isFormOpen} title="Editar supervisor" onClose={supervisores.onCloseForm}>
          <SupervisorForm
            state={{ values: supervisores.values, error: supervisores.error, isSubmitting: supervisores.isSubmitting }}
            actions={{ onFieldChange: supervisores.updateField, onSubmit: supervisores.handleSubmit }}
            fincas={fincas}
          />
        </Modal>

        <Modal isOpen={invitacion.isOpen} title="Invitar usuario" onClose={invitacion.cerrar}>
          <InvitarUsuarioForm
            email={invitacion.email}
            error={invitacion.error}
            isSubmitting={invitacion.isSubmitting}
            onEmailChange={invitacion.setEmail}
            onSubmit={invitacion.handleSubmit}
          />
        </Modal>
      </div>
    </main>
  )
}
