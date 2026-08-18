import { useNavigate } from 'react-router-dom'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useUsuarioActual } from '../../auth/hooks/use-usuario-actual'
import { TrasladosTable } from '../../traslados/components/TrasladosTable'
import { SolicitarTrasladoFincaStep } from '../../traslados/components/SolicitarTrasladoFincaStep'
import { SolicitarTrasladoTrabajadoresStep } from '../../traslados/components/SolicitarTrasladoTrabajadoresStep'
import { TrasladosFilterBar } from '../../traslados/components/TrasladosFilterBar'
import { useSolicitarTraslado } from '../../traslados/hooks/use-solicitar-traslado'
import { useFiltrosTraslados } from '../../traslados/hooks/use-filtros-traslados'
import { WizardHeader } from '../../../shared/components/WizardHeader'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'

const TOTAL_PASOS = 2

export function TrasladosScreen() {
  const navigate = useNavigate()
  const dashboard = useSupervisorDashboard()
  const perfil = usePerfilSidebar()
  const { usuario } = useUsuarioActual()
  const fincaId = usuario?.fincaId ?? undefined
  const traslado = useSolicitarTraslado(fincaId)
  const filtros = useFiltrosTraslados(traslado.misTraslados, fincaId ?? '')
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

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <WizardHeader
            paso={traslado.paso}
            totalPasos={TOTAL_PASOS}
            titulo={traslado.paso === 1 ? '¿De qué finca?' : `Trabajadores de ${traslado.fincaElegida?.fincaNombre ?? ''}`}
            onAtras={traslado.paso === 1 ? () => navigate('/supervisor') : traslado.volverAFincas}
          />

          {traslado.paso === 1 && <SolicitarTrasladoFincaStep fincas={traslado.fincasDisponibles} isLoading={traslado.isLoading} onElegir={traslado.elegirFinca} />}

          {traslado.paso === 2 && (
            <SolicitarTrasladoTrabajadoresStep
              state={{
                trabajadores: traslado.trabajadoresDeFincaElegida,
                fecha: traslado.fecha,
                seleccionados: traslado.seleccionados,
                isSubmitting: traslado.isSubmitting,
              }}
              actions={{
                onFechaChange: traslado.setFecha,
                onToggleTrabajador: traslado.alternarSeleccion,
                onSubmit: traslado.enviarSolicitud,
              }}
            />
          )}

          <h2 className="mb-3 mt-6 text-xl font-black text-slate-900">Historial de traspasos</h2>
          <TrasladosFilterBar
            filtros={filtros.filtros}
            traslados={traslado.misTraslados}
            fincaPropiaId={fincaId ?? ''}
            onFiltroChange={filtros.setFiltro}
            onResetFiltros={filtros.resetFiltros}
          />
          <TrasladosTable traslados={filtros.trasladosFiltrados} fincaPropiaId={fincaId ?? ''} isLoading={traslado.isLoadingMisTraslados} />
        </section>
      </div>
    </main>
  )
}
