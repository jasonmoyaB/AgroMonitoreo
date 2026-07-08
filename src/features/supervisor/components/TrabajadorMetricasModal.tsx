import { Clock, Package, TrendingUp } from 'lucide-react'
import { Modal } from '../../../shared/components/Modal'
import type { TrabajadorMetricasModalActions, TrabajadorMetricasModalState } from '../types/trabajador-metricas.types'
import { DashboardKpiCard } from './DashboardKpiCard'
import { TrabajadorMetricasFiltros } from './TrabajadorMetricasFiltros'
import { TrabajadorMetricasTabla } from './TrabajadorMetricasTabla'

interface TrabajadorMetricasModalProps {
  state: TrabajadorMetricasModalState
  actions: TrabajadorMetricasModalActions
}

export function TrabajadorMetricasModal({ state, actions }: TrabajadorMetricasModalProps) {
  const { trabajador, isOpen, filtros, aniosDisponibles, metricasPorLabor, totales, isLoading } = state

  return (
    <Modal isOpen={isOpen} title={trabajador?.nombreCompleto ?? 'Métricas del trabajador'} onClose={actions.onClose} size="lg">
      <div className="flex flex-col gap-6">
        <TrabajadorMetricasFiltros
          filtros={filtros}
          aniosDisponibles={aniosDisponibles}
          onFiltroChange={actions.onFiltroChange}
          onResetFiltros={actions.onResetFiltros}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardKpiCard icon={Clock} etiqueta="Horas totales" valor={totales.horas.toLocaleString('es-CL')} />
          <DashboardKpiCard icon={Package} etiqueta="Cantidad total" valor={totales.cantidad.toLocaleString('es-CL')} />
          <DashboardKpiCard icon={TrendingUp} etiqueta="Productividad promedio" valor={totales.productividad.toFixed(1)} />
        </div>

        {isLoading ? <p className="font-bold text-slate-500">Cargando métricas.</p> : <TrabajadorMetricasTabla metricas={metricasPorLabor} />}
      </div>
    </Modal>
  )
}
