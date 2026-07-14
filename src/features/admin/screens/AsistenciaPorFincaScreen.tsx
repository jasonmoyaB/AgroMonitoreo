import { useState } from 'react'
import { useAsistenciaSemana } from '../../asistencia/hooks/use-asistencia-semana'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { AsistenciaTable } from '../../../shared/components/AsistenciaTable'
import { SelectorSemana } from '../../../shared/components/SelectorSemana'
import { AdminSidebar } from '../components/AdminSidebar'
import { FincaSelector } from '../components/FincaSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'

export function AsistenciaPorFincaScreen() {
  const dashboard = useAdminDashboard()
  const { fincas } = useFincas()
  const [fincaSeleccionadaId, setFincaSeleccionadaId] = useState<string | null>(null)
  const fincaId = fincaSeleccionadaId ?? fincas[0]?.id ?? ''
  const asistencia = useAsistenciaSemana(fincaId)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Asistencia por finca</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Elige una finca para ver sus ausencias de la semana.</p>
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId || null} onSeleccionar={setFincaSeleccionadaId} />

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
