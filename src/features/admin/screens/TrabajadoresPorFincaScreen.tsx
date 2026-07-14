import { useState } from 'react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminTrabajadoresTable } from '../components/AdminTrabajadoresTable'
import { FincaSelector } from '../components/FincaSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'
import { useTrabajadoresFincaAdmin } from '../hooks/use-trabajadores-finca-admin'
import { TrabajadorMetricasModal } from '../../trabajadores/components/TrabajadorMetricasModal'
import { useTrabajadorMetricasModal } from '../../trabajadores/hooks/use-trabajador-metricas-modal'

export function TrabajadoresPorFincaScreen() {
  const dashboard = useAdminDashboard()
  const { fincas } = useFincas()
  const [fincaSeleccionadaId, setFincaSeleccionadaId] = useState<string | null>(null)
  const fincaId = fincaSeleccionadaId ?? fincas[0]?.id ?? null
  const trabajadores = useTrabajadoresFincaAdmin(fincaId)
  const metricasModal = useTrabajadorMetricasModal()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Trabajadores por finca</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Elige una finca para ver su lista de trabajadores.</p>
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={setFincaSeleccionadaId} />

          <AdminTrabajadoresTable
            trabajadores={trabajadores.trabajadores}
            isLoading={trabajadores.isLoading}
            onSelectTrabajador={metricasModal.abrir}
          />
        </section>

        <TrabajadorMetricasModal
          state={metricasModal}
          actions={{ onFiltroChange: metricasModal.updateFiltro, onResetFiltros: metricasModal.resetFiltros, onClose: metricasModal.cerrar }}
        />
      </div>
    </main>
  )
}
