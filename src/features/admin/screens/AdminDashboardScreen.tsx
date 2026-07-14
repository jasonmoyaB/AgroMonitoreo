import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { DashboardKpiRow } from '../../../shared/components/DashboardKpiRow'
import { RankingBarChart } from '../../../shared/components/RankingBarChart'
import { TendenciaLineChart } from '../../../shared/components/TendenciaLineChart'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useAdminRollupKpis } from '../hooks/use-admin-rollup-kpis'

const UNIDAD_GENERICA = 'unidades'

export function AdminDashboardScreen() {
  const dashboard = useAdminDashboard()
  const rollup = useAdminRollupKpis()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 md:gap-4">
          <header className="neu-raised shrink-0 rounded-[2rem] p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl font-bold leading-7 text-slate-600">Resumen del mes en todas las fincas.</p>
          </header>

          {rollup.isLoading ? (
            <p className="font-bold text-slate-600">Cargando datos…</p>
          ) : (
            <>
              <DashboardKpiRow kpis={rollup.kpis} />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <RankingBarChart titulo="Mejor labor del mes" items={rollup.rankingLabores} unidad={UNIDAD_GENERICA} />
                <RankingBarChart titulo="Mejor trabajador del mes" items={rollup.rankingTrabajadores} unidad={UNIDAD_GENERICA} />
              </div>
              <TendenciaLineChart titulo="Producción diaria del mes" puntos={rollup.tendenciaDiaria} unidad={UNIDAD_GENERICA} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
