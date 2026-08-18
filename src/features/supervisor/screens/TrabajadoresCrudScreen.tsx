import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { useTrabajadoresCrud } from '../../trabajadores/hooks/use-trabajadores-crud'
import { useTrabajadoresFiltro } from '../../trabajadores/hooks/use-trabajadores-filtro'
import { useTrabajadoresTrasladadosHoy } from '../../traslados/hooks/use-trabajadores-trasladados-hoy'
import { Modal } from '../../../shared/components/Modal'
import { BOTON_PRIMARIO_COMPACTO } from '../../../shared/constants/botones.constants'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { TrabajadorForm } from '../components/TrabajadorForm'
import { TrabajadorDetalleModal } from '../../trabajadores/components/TrabajadorDetalleModal'
import { TrabajadorMetricasModal } from '../../trabajadores/components/TrabajadorMetricasModal'
import { TrabajadoresFilterBar } from '../../trabajadores/components/TrabajadoresFilterBar'
import { TrabajadoresTable } from '../components/TrabajadoresTable'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useTrabajadorMetricasModal } from '../../trabajadores/hooks/use-trabajador-metricas-modal'
import { fechaLocalIso } from '../../../shared/utils/fecha-local'
import type { Trabajador } from '../../../shared/types/domain.types'

export function TrabajadoresCrudScreen() {
  const [trabajadorVisto, setTrabajadorVisto] = useState<Trabajador | null>(null)
  const dashboard = useSupervisorDashboard()
  const trabajadores = useTrabajadoresCrud()
  const filtro = useTrabajadoresFiltro(trabajadores.trabajadores)
  const metricasModal = useTrabajadorMetricasModal()
  const { data: trasladados = [] } = useTrabajadoresTrasladadosHoy(trabajadores.finca.id, fechaLocalIso())
  const fincaDestinoPorTrasladado = new Map(trasladados.map((trasladado) => [trasladado.trabajadorId, trasladado.fincaDestinoNombre]))
  const perfil = usePerfilSidebar()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

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
          <header className="neu-raised mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[2rem] p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">{trabajadores.finca.nombre}</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Trabajadores</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Edita, activa o inactiva trabajadores registrados.</p>
            </div>
            <button
              type="button"
              onClick={trabajadores.onOpenCreate}
              className={`${BOTON_PRIMARIO_COMPACTO} shrink-0`}
            >
              <UserPlus className="h-5 w-5" aria-hidden="true" />
              Agregar trabajador
            </button>
          </header>

          <TrabajadoresFilterBar filtros={filtro.filtros} onFiltroChange={filtro.updateFiltro} onResetFiltros={filtro.resetFiltros} />

          <TrabajadoresTable
            trabajadores={filtro.trabajadoresFiltrados}
            isLoading={trabajadores.isLoading}
            fincaDestinoPorTrasladado={fincaDestinoPorTrasladado}
            actions={{
              onVer: setTrabajadorVisto,
              onEdit: trabajadores.editarTrabajador,
              onToggleActive: trabajadores.alternarEstado,
              onSelectTrabajador: metricasModal.abrir,
            }}
          />
        </section>

        <Modal isOpen={trabajadores.isFormOpen} title={trabajadores.trabajadorEditando ? 'Editar trabajador' : 'Agregar trabajador'} onClose={trabajadores.onCloseForm}>
          <TrabajadorForm
            state={trabajadores}
            actions={{ onFieldChange: trabajadores.updateField, onFotoChange: trabajadores.onFotoChange, onSubmit: trabajadores.handleSubmit }}
          />
        </Modal>

        <TrabajadorDetalleModal trabajador={trabajadorVisto} onClose={() => setTrabajadorVisto(null)} />

        <TrabajadorMetricasModal
          state={metricasModal}
          actions={{ onFiltroChange: metricasModal.updateFiltro, onResetFiltros: metricasModal.resetFiltros, onClose: metricasModal.cerrar }}
          fincaNombre={trabajadores.finca.nombre}
        />
      </div>
    </main>
  )
}
