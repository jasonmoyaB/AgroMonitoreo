import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { useAsistenciaSemana } from '../../asistencia/hooks/use-asistencia-semana'
import { FINCA_ACTUAL } from '../../../shared/constants/finca.constants'
import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { SelectorSemana } from '../components/SelectorSemana'
import { AsistenciaTable } from '../components/AsistenciaTable'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'

export function AsistenciaScreen() {
  const dashboard = useSupervisorDashboard()
  const asistencia = useAsistenciaSemana(FINCA_ACTUAL.id)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <SupervisorSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">{FINCA_ACTUAL.nombre}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Asistencia</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Ausencias registradas por semana.</p>
          </header>

          <SelectorSemana
            etiqueta={asistencia.rango.etiqueta}
            deshabilitarSiguiente={asistencia.esSemanaActual}
            onAnterior={asistencia.irASemanaAnterior}
            onSiguiente={asistencia.irASemanaSiguiente}
          />

          <AsistenciaTable registros={asistencia.registros} isLoading={asistencia.isLoading} />
        </section>
      </div>
    </main>
  )
}
