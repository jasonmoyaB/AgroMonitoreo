import { useState } from 'react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { AdminSidebar } from '../components/AdminSidebar'
import { SalariosTable } from '../components/SalariosTable'
import { FincaSelector } from '../components/FincaSelector'
import { ValorHoraInput } from '../components/ValorHoraInput'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'
import { useSalariosFinca } from '../hooks/use-salarios-finca'
import { useActualizarValorHora } from '../hooks/use-actualizar-valor-hora'

export function SalariosScreen() {
  const dashboard = useAdminDashboard()
  const { fincas } = useFincas()
  const [fincaSeleccionadaId, setFincaSeleccionadaId] = useState<string | null>(null)
  const fincaId = fincaSeleccionadaId ?? fincas[0]?.id ?? null
  const finca = fincas.find((f) => f.id === fincaId) ?? null
  const { salarios, isLoading, guardar } = useSalariosFinca(fincaId)
  const actualizarValorHora = useActualizarValorHora()
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Salarios</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">Elige una finca para ver y editar el salario mensual de cada trabajador.</p>
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={setFincaSeleccionadaId} />

          {finca && (
            <div className="neu-raised mb-4 rounded-3xl p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Valor hora de {finca.nombre}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <ValorHoraInput finca={finca} moneda="colones" onGuardar={actualizarValorHora.mutate} />
                <ValorHoraInput finca={finca} moneda="usd" onGuardar={actualizarValorHora.mutate} />
              </div>
              <p className="mt-3 font-bold leading-6 text-slate-600">Con esto se descuenta cada día de ausencia en la planilla: valor hora × 8 horas.</p>
            </div>
          )}

          <SalariosTable salarios={salarios} isLoading={isLoading} onGuardar={guardar} />
        </section>
      </div>
    </main>
  )
}
