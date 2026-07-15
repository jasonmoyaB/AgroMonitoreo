import { useState } from 'react'
import { useAusenciasTrabajador } from '../../asistencia/hooks/use-ausencias-trabajador'
import { useAsistenciaSemana } from '../../asistencia/hooks/use-asistencia-semana'
import { useCalendarioAusentes } from '../../asistencia/hooks/use-calendario-ausentes'
import { useCalendarioAusentesModal } from '../../asistencia/hooks/use-calendario-ausentes-modal'
import { useDetalleAsistenciaModal } from '../../asistencia/hooks/use-detalle-asistencia-modal'
import { useDescargarAusenciasPdf } from '../../asistencia/hooks/use-descargar-ausencias-pdf'
import { useRegistrarAusenciaCalendario } from '../../asistencia/hooks/use-registrar-ausencia-calendario'
import { AusenciaCalendarioForm } from '../../asistencia/components/AusenciaCalendarioForm'
import { AsistenciaTrabajadoresTable } from '../../asistencia/components/AsistenciaTrabajadoresTable'
import { AusenciasTrabajadorPanel } from '../../asistencia/components/AusenciasTrabajadorPanel'
import { CalendarioAusentesPanel } from '../../asistencia/components/CalendarioAusentesPanel'
import { DescargarAusenciasPdfControls } from '../../asistencia/components/DescargarAusenciasPdfControls'
import { useTrabajadoresFiltro } from '../../trabajadores/hooks/use-trabajadores-filtro'
import { TrabajadoresFilterBar } from '../../trabajadores/components/TrabajadoresFilterBar'
import { useCerrarSesion } from '../../auth/hooks/use-cerrar-sesion'
import { usePerfilSidebar } from '../../auth/hooks/use-perfil-sidebar'
import { Modal } from '../../../shared/components/Modal'
import { AsistenciaTable } from '../../../shared/components/AsistenciaTable'
import { SelectorSemana } from '../../../shared/components/SelectorSemana'
import type { Finca } from '../../../shared/types/domain.types'
import { AdminSidebar } from '../components/AdminSidebar'
import { FincaSelector } from '../components/FincaSelector'
import { useAdminDashboard } from '../hooks/use-admin-dashboard'
import { useFincas } from '../hooks/use-fincas'
import { useTrabajadoresFincaAdmin } from '../hooks/use-trabajadores-finca-admin'

const FINCA_VACIA: Pick<Finca, 'id' | 'nombre'> = { id: '', nombre: '' }

export function AsistenciaPorFincaScreen() {
  const dashboard = useAdminDashboard()
  const { fincas } = useFincas()
  const [fincaSeleccionadaId, setFincaSeleccionadaId] = useState<string | null>(null)
  const fincaId = fincaSeleccionadaId ?? fincas[0]?.id ?? null
  const finca = fincas.find((item) => item.id === fincaId) ?? FINCA_VACIA
  const asistencia = useAsistenciaSemana(fincaId ?? undefined)
  const trabajadores = useTrabajadoresFincaAdmin(fincaId)
  const filtro = useTrabajadoresFiltro(trabajadores.trabajadores)
  const detalleModal = useDetalleAsistenciaModal()
  const calendarioModal = useRegistrarAusenciaCalendario(fincaId ?? undefined)
  const ausentesModal = useCalendarioAusentesModal()
  const calendarioAusentes = useCalendarioAusentes(fincaId ?? undefined)
  const detalleAusencias = useAusenciasTrabajador(fincaId ?? undefined, detalleModal.trabajador?.id ?? null)
  const descargarAusenciasPdf = useDescargarAusenciasPdf(finca)
  const { isSigningOut, handleCerrarSesion } = useCerrarSesion()
  const perfil = usePerfilSidebar()

  return (
    <main className="h-dvh overflow-hidden p-3 sm:p-4">
      <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
        <AdminSidebar isCollapsed={dashboard.isSidebarCollapsed} isSigningOut={isSigningOut} perfil={perfil} onToggle={dashboard.toggleSidebar} onSignOut={handleCerrarSesion} />

        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <header className="neu-raised mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[2rem] p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-green-800">Admin</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Asistencia por finca</h1>
              <p className="mt-2 font-bold leading-7 text-slate-600">Elige una finca, revisa sus ausencias y registra nuevas.</p>
            </div>
            <DescargarAusenciasPdfControls
              anio={descargarAusenciasPdf.anio}
              mes={descargarAusenciasPdf.mes}
              aniosDisponibles={descargarAusenciasPdf.aniosDisponibles}
              isDownloading={descargarAusenciasPdf.isDownloading}
              actions={{
                onAnioChange: descargarAusenciasPdf.setAnio,
                onMesChange: descargarAusenciasPdf.setMes,
                onDescargar: descargarAusenciasPdf.descargar,
              }}
            />
          </header>

          <FincaSelector fincas={fincas} fincaSeleccionadaId={fincaId} onSeleccionar={setFincaSeleccionadaId} />

          <TrabajadoresFilterBar filtros={filtro.filtros} onFiltroChange={filtro.updateFiltro} onResetFiltros={filtro.resetFiltros} mostrarAusentes onVerAusentes={ausentesModal.abrir} />

          <AsistenciaTrabajadoresTable
            trabajadores={filtro.trabajadoresFiltrados}
            isLoading={trabajadores.isLoading}
            onVer={detalleModal.abrir}
            onAgregar={calendarioModal.abrir}
          />

          <h2 className="mb-3 mt-6 text-xl font-black text-slate-900">Ausencias de la semana</h2>

          <SelectorSemana
            etiqueta={asistencia.rango.etiqueta}
            deshabilitarSiguiente={asistencia.esSemanaActual}
            onAnterior={asistencia.irASemanaAnterior}
            onSiguiente={asistencia.irASemanaSiguiente}
          />

          <AsistenciaTable registros={asistencia.registros} isLoading={asistencia.isLoading} />
        </section>

        <Modal isOpen={detalleModal.isOpen} title="Detalle de asistencia" onClose={detalleModal.cerrar}>
          <AusenciasTrabajadorPanel
            trabajador={detalleModal.trabajador}
            ausencias={detalleAusencias.data ?? []}
            isLoading={detalleAusencias.isLoading}
          />
        </Modal>

        <Modal isOpen={calendarioModal.isOpen} title="Agregar ausencia" onClose={calendarioModal.cerrar}>
          <AusenciaCalendarioForm
            trabajador={calendarioModal.trabajador}
            anio={calendarioModal.anio}
            mes={calendarioModal.mes}
            fechasSeleccionadas={calendarioModal.fechas}
            tipo={calendarioModal.tipo}
            error={calendarioModal.error}
            isSubmitting={calendarioModal.isSubmitting}
            onCambiarMes={calendarioModal.cambiarMes}
            onToggleFecha={calendarioModal.toggleFecha}
            onSeleccionarTipo={calendarioModal.seleccionarTipo}
            onSubmit={calendarioModal.handleSubmit}
            construirFecha={calendarioModal.construirFecha}
          />
        </Modal>

        <Modal isOpen={ausentesModal.isOpen} title="Calendario de ausentes" onClose={ausentesModal.cerrar} size="xl">
          <CalendarioAusentesPanel
            anio={calendarioAusentes.anio}
            mes={calendarioAusentes.mes}
            registros={calendarioAusentes.registros}
            isLoading={calendarioAusentes.isLoading}
            onCambiarMes={calendarioAusentes.cambiarMes}
          />
        </Modal>
      </div>
    </main>
  )
}
