import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { DashboardKpiRow } from '../../../shared/components/DashboardKpiRow'
import { DashboardPorUnidad } from '../../../shared/components/DashboardPorUnidad'
import { HorasPorLaborChart } from '../../../shared/components/HorasPorLaborChart'
import { DescargarDashboardPdfButton } from '../../../shared/components/DescargarDashboardPdfButton'
import { AdminSidebar } from '../components/AdminSidebar'
import { PeriodoSelector } from '../components/PeriodoSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useAdminRollupKpis } from '../hooks/use-admin-rollup-kpis'
import { usePeriodoDashboard } from '../hooks/use-periodo-dashboard'
import { useDescargarDashboardPdf } from '../../../shared/hooks/use-descargar-dashboard-pdf'

export function AdminDashboardScreen() {
  const dashboard = useAdminDashboard()
  const periodo = usePeriodoDashboard()
  const rollup = useAdminRollupKpis(periodo.periodo)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()
  const pdf = useDescargarDashboardPdf({
    archivoPrefijo: 'dashboard-admin',
    titulo: 'Dashboard',
    subtitulo: `Todas las fincas — ${periodo.periodoNombre}`,
    kpis: rollup.kpis,
    porUnidad: rollup.porUnidad,
  })

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 md:gap-4">
          <header className="neu-raised flex shrink-0 flex-wrap items-start justify-between gap-3 rounded-[2rem] p-4 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl font-bold leading-7 text-slate-600">Elige un mes para ver el resumen de todas las fincas.</p>
            </div>
            <DescargarDashboardPdfButton isDownloading={pdf.isDownloading} onDescargar={pdf.descargar} />
          </header>

          <PeriodoSelector anio={periodo.anio} mes={periodo.mes} aniosDisponibles={rollup.aniosDisponibles} onAnioChange={periodo.setAnio} onMesChange={periodo.setMes} />

          {rollup.isLoading ? (
            <p className="font-bold text-slate-600">Cargando datos…</p>
          ) : (
            <>
              <DashboardKpiRow kpis={rollup.kpis} />
              <DashboardPorUnidad bloques={rollup.porUnidad} sufijoTitulo={`· ${periodo.periodoNombre}`} />
              <HorasPorLaborChart titulo="En qué se van las horas" items={rollup.horasPorLabor} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
