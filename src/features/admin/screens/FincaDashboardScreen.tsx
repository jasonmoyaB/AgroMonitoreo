import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { DashboardKpiRow } from '../../../shared/components/DashboardKpiRow'
import { RankingBarChart } from '../../../shared/components/RankingBarChart'
import { ProduccionDiariaChart } from '../../../shared/components/ProduccionDiariaChart'
import { HorasPorLaborChart } from '../../../shared/components/HorasPorLaborChart'
import { DescargarDashboardPdfButton } from '../../../shared/components/DescargarDashboardPdfButton'
import { AdminSidebar } from '../components/AdminSidebar'
import { FincaSelector } from '../components/FincaSelector'
import { PeriodoSelector } from '../components/PeriodoSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincaDashboardKpis } from '../hooks/use-finca-dashboard-kpis'
import { useFincaSeleccionada } from '../hooks/use-finca-seleccionada'
import { usePeriodoDashboard } from '../hooks/use-periodo-dashboard'
import { useDescargarDashboardPdf } from '../../../shared/hooks/use-descargar-dashboard-pdf'

const UNIDAD_GENERICA = 'unidades'
const FINCA_NOMBRE_FALLBACK = 'Finca'

export function FincaDashboardScreen() {
  const dashboard = useAdminDashboard()
  const { fincas, fincaId, finca, seleccionar } = useFincaSeleccionada()
  const periodo = usePeriodoDashboard()
  const fincaNombre = finca?.nombre ?? FINCA_NOMBRE_FALLBACK
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()
  const kpisFinca = useFincaDashboardKpis(fincaId, periodo.periodo)
  const periodoNombre = periodo.periodoNombre
  const pdf = useDescargarDashboardPdf({
    archivoPrefijo: `dashboard-${fincaNombre}`,
    titulo: 'Dashboard por finca',
    subtitulo: `${fincaNombre} — ${periodoNombre}`,
    kpis: kpisFinca.kpis,
    rankingLabores: kpisFinca.rankingLabores,
    rankingTrabajadores: kpisFinca.rankingTrabajadores,
    tendenciaDiaria: kpisFinca.tendenciaDiaria,
  })

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 md:gap-4">
          <header className="neu-raised flex shrink-0 flex-wrap items-start justify-between gap-3 rounded-[2rem] p-4 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Dashboard por finca</h1>
              <p className="mt-2 max-w-2xl font-bold leading-7 text-slate-600">Elige una finca y un mes para ver su resumen.</p>
            </div>
            <DescargarDashboardPdfButton isDownloading={pdf.isDownloading} onDescargar={pdf.descargar} />
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={seleccionar} />
          <PeriodoSelector anio={periodo.anio} mes={periodo.mes} aniosDisponibles={kpisFinca.aniosDisponibles} onAnioChange={periodo.setAnio} onMesChange={periodo.setMes} />

          {kpisFinca.isLoading ? (
            <p className="font-bold text-slate-600">Cargando datos…</p>
          ) : (
            <>
              <DashboardKpiRow kpis={kpisFinca.kpis} />
              <ProduccionDiariaChart titulo={`Producción diaria · ${periodoNombre}`} produccion={kpisFinca.produccionDiaria} unidad={UNIDAD_GENERICA} />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                <RankingBarChart titulo={`Mejor labor · ${periodoNombre}`} items={kpisFinca.rankingLabores} unidad={UNIDAD_GENERICA} />
                <RankingBarChart titulo={`Mejor trabajador · ${periodoNombre}`} items={kpisFinca.rankingTrabajadores} unidad={UNIDAD_GENERICA} />
                <div className="md:col-span-2 xl:col-span-1">
                  <HorasPorLaborChart titulo="En qué se van las horas" items={kpisFinca.horasPorLabor} />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
