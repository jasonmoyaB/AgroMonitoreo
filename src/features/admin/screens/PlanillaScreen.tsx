import { useState } from 'react'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { descargarBlob } from '../../../shared/lib/descargar-blob'
import { formatearFechaIsoDdMmAaaa } from '../../../shared/utils/fecha-iso'
import { AdminSidebar } from '../components/AdminSidebar'
import { AusenciasQuincenaModal } from '../components/AusenciasQuincenaModal'
import { FincaSelector } from '../components/FincaSelector'
import { GrupoSeguroSelector } from '../components/GrupoSeguroSelector'
import { PeriodoSelector } from '../components/PeriodoSelector'
import { PlanillaTable } from '../components/PlanillaTable'
import { ValorHoraFinca } from '../components/ValorHoraFinca'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useAniosDashboard } from '../hooks/use-anios-dashboard'
import { useFincaSeleccionada } from '../hooks/use-finca-seleccionada'
import { OPCIONES_QUINCENA } from '../../planilla/constants/quincena.constants'
import { usePeriodoQuincena } from '../../planilla/hooks/use-periodo-quincena'
import { usePlanillaQuincena } from '../../planilla/hooks/use-planilla-quincena'
import { GRUPO_SEGURO_INICIAL } from '../../planilla/constants/seguro.constants'
import { filtrarFilasPorSeguro } from '../../planilla/utils/filtrar-filas-por-seguro'
import { generarPdfLiquidacion } from '../../planilla/utils/generar-pdf-liquidacion'
import type { GrupoSeguro, NumeroQuincena } from '../../planilla/types/planilla.types'
import type { FilaPlanilla } from '../../planilla/types/planilla.types'

export function PlanillaScreen() {
  const dashboard = useAdminDashboard()
  const { fincas, fincaId, finca, seleccionar } = useFincaSeleccionada()
  const aniosDisponibles = useAniosDashboard()
  const periodo = usePeriodoQuincena()
  const [filaAusencias, setFilaAusencias] = useState<FilaPlanilla | null>(null)
  const [grupoSeguro, setGrupoSeguro] = useState<GrupoSeguro>(GRUPO_SEGURO_INICIAL)
  const fincaNombre = finca?.nombre ?? ''
  const { filas, isLoading, pagar, guardarSalario } = usePlanillaQuincena(finca, periodo.rango)
  const filasDelGrupo = filtrarFilasPorSeguro(filas, grupoSeguro)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  const handlePagar = (fila: FilaPlanilla) => {
    if (fincaId === null) return
    pagar({
      fincaId,
      trabajadorId: fila.trabajadorId,
      quincenaInicio: periodo.rango.inicio,
      quincenaFin: periodo.rango.fin,
      monto: fila.montoNeto,
      montoBruto: fila.montoQuincena,
      diasAusentes: fila.ausencias.length,
      moneda: fila.moneda,
    })
  }

  const handleDescargarPdf = (fila: FilaPlanilla) => {
    const pdf = generarPdfLiquidacion({
      nombreCompleto: fila.nombreCompleto,
      fincaNombre,
      inicio: fila.pago?.quincenaInicio ?? periodo.rango.inicio,
      fin: fila.pago?.quincenaFin ?? periodo.rango.fin,
      monto: fila.pago?.monto ?? fila.montoNeto,
      montoBruto: fila.pago?.montoBruto ?? fila.montoQuincena,
      diasAusentes: fila.pago?.diasAusentes ?? fila.ausencias.length,
      moneda: fila.pago?.moneda ?? fila.moneda,
    })
    descargarBlob(pdf, `liquidacion-${fila.nombreCompleto}-${periodo.rango.inicio}.pdf`)
  }

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <header className="neu-raised mb-4 rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Planilla</h1>
            <p className="mt-2 font-bold leading-7 text-slate-600">
              Quincena del {formatearFechaIsoDdMmAaaa(periodo.rango.inicio)} al {formatearFechaIsoDdMmAaaa(periodo.rango.fin)}. El monto es la mitad del salario mensual menos los días de ausencia, a valor hora × 8. El salario se edita en la misma tabla.
            </p>
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={seleccionar} />

          {finca && <ValorHoraFinca finca={finca} />}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <PeriodoSelector anio={periodo.anio} mes={periodo.mes} aniosDisponibles={aniosDisponibles} onAnioChange={periodo.setAnio} onMesChange={periodo.setMes} />
            <label className="neu-pressed flex min-h-14 items-center rounded-2xl px-3 font-black text-slate-700">
              <span className="sr-only">Quincena</span>
              <select
                value={periodo.quincena}
                onChange={(event) => periodo.setQuincena(Number(event.target.value) as NumeroQuincena)}
                className="cursor-pointer bg-transparent outline-none"
              >
                {OPCIONES_QUINCENA.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <GrupoSeguroSelector grupo={grupoSeguro} onGrupoChange={setGrupoSeguro} />

          <PlanillaTable
            filas={filasDelGrupo}
            isLoading={isLoading}
            actions={{ onPagar: handlePagar, onDescargarPdf: handleDescargarPdf, onVerAusencias: setFilaAusencias, onGuardarSalario: guardarSalario }}
          />
        </section>

        <AusenciasQuincenaModal fila={filaAusencias} onClose={() => setFilaAusencias(null)} />
      </div>
    </main>
  )
}
