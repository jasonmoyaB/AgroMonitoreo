import { SupervisorSidebar } from '../components/SupervisorSidebar'
import { DashboardKpiRow } from '../../../shared/components/DashboardKpiRow'
import { RankingBarChart } from '../../../shared/components/RankingBarChart'
import { TendenciaLineChart } from '../../../shared/components/TendenciaLineChart'
import { DescargarDashboardPdfButton } from '../../../shared/components/DescargarDashboardPdfButton'
import { useDashboardKpis } from '../hooks/use-dashboard-kpis'
import { useSupervisorDashboard } from '../hooks/use-supervisor-dashboard'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { useDescargarDashboardPdf } from '../../../shared/hooks/use-descargar-dashboard-pdf'

const UNIDAD_GENERICA = 'unidades'

export function DashboardScreen() {
  const sidebar = useSupervisorDashboard()
  const dashboard = useDashboardKpis()
  const perfil = usePerfilSidebar()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const pdf = useDescargarDashboardPdf({
    archivoPrefijo: 'dashboard-supervisor',
    titulo: 'Dashboard',
    subtitulo: 'Resumen del mes: producción, horas y quiénes destacan.',
    kpis: dashboard.kpis,
    rankingLabores: dashboard.rankingLabores,
    rankingTrabajadores: dashboard.rankingTrabajadores,
    tendenciaDiaria: dashboard.tendenciaDiaria,
  })

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <SupervisorSidebar
          isCollapsed={sidebar.isSidebarCollapsed}
          isSigningOut={isSigningOut}
          perfil={perfil}
          onToggle={sidebar.toggleSidebar}
          onSignOut={handleCerrarSesion}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 md:gap-4">
          <header className="neu-raised flex shrink-0 flex-wrap items-start justify-between gap-3 rounded-[2rem] p-4 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Supervisor</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl font-bold leading-7 text-slate-600">Resumen del mes: producción, horas y quiénes destacan.</p>
            </div>
            <DescargarDashboardPdfButton isDownloading={pdf.isDownloading} onDescargar={pdf.descargar} />
          </header>

          {dashboard.isLoading ? (
            <p className="font-bold text-slate-600">Cargando datos…</p>
          ) : (
            <>
              <DashboardKpiRow kpis={dashboard.kpis} />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <RankingBarChart titulo="Mejor labor del mes" items={dashboard.rankingLabores} unidad={UNIDAD_GENERICA} />
                <RankingBarChart titulo="Mejor trabajador del mes" items={dashboard.rankingTrabajadores} unidad={UNIDAD_GENERICA} />
              </div>
              <TendenciaLineChart titulo="Producción diaria del mes" puntos={dashboard.tendenciaDiaria} unidad={UNIDAD_GENERICA} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
