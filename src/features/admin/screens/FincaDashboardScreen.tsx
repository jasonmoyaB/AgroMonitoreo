import { useState } from 'react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { DashboardKpiRow } from '../../../shared/components/DashboardKpiRow'
import { RankingBarChart } from '../../../shared/components/RankingBarChart'
import { TendenciaLineChart } from '../../../shared/components/TendenciaLineChart'
import { DescargarDashboardPdfButton } from '../../../shared/components/DescargarDashboardPdfButton'
import { AdminSidebar } from '../components/AdminSidebar'
import { FincaSelector } from '../components/FincaSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincaDashboardKpis } from '../hooks/use-finca-dashboard-kpis'
import { useFincas } from '../hooks/use-fincas'
import { useDescargarDashboardPdf } from '../../../shared/hooks/use-descargar-dashboard-pdf'

const UNIDAD_GENERICA = 'unidades'

export function FincaDashboardScreen() {
  const dashboard = useAdminDashboard()
  const { fincas } = useFincas()
  const [fincaSeleccionadaId, setFincaSeleccionadaId] = useState<string | null>(null)
  const fincaId = fincaSeleccionadaId ?? fincas[0]?.id ?? null
  const fincaNombre = fincas.find((finca) => finca.id === fincaId)?.nombre ?? 'Finca'
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()
  const kpisFinca = useFincaDashboardKpis(fincaId)
  const pdf = useDescargarDashboardPdf({
    archivoPrefijo: `dashboard-${fincaNombre}`,
    titulo: 'Dashboard por finca',
    subtitulo: fincaNombre,
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
              <p className="mt-2 max-w-2xl font-bold leading-7 text-slate-600">Elige una finca para ver su resumen del mes.</p>
            </div>
            <DescargarDashboardPdfButton isDownloading={pdf.isDownloading} onDescargar={pdf.descargar} />
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={setFincaSeleccionadaId} />

          {kpisFinca.isLoading ? (
            <p className="font-bold text-slate-600">Cargando datos…</p>
          ) : (
            <>
              <DashboardKpiRow kpis={kpisFinca.kpis} />
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <RankingBarChart titulo="Mejor labor del mes" items={kpisFinca.rankingLabores} unidad={UNIDAD_GENERICA} />
                <RankingBarChart titulo="Mejor trabajador del mes" items={kpisFinca.rankingTrabajadores} unidad={UNIDAD_GENERICA} />
              </div>
              <TendenciaLineChart titulo="Producción diaria del mes" puntos={kpisFinca.tendenciaDiaria} unidad={UNIDAD_GENERICA} />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
