import { Clock, Package, TrendingUp, Zap } from 'lucide-react'
import { Modal } from '../../../shared/components/Modal'
import { useDescargarMetricasTrabajadorPdf } from '../hooks/use-descargar-metricas-trabajador-pdf'
import { agruparCantidadPorUnidad } from '../utils/agrupar-cantidad-por-unidad'
import type { TrabajadorMetricasModalActions, TrabajadorMetricasModalState } from '../types/trabajador-metricas.types'
import { DashboardKpiCard } from '../../../shared/components/DashboardKpiCard'
import { DescargarMetricasPdfButton } from './DescargarMetricasPdfButton'
import { TrabajadorMetricasFiltros } from './TrabajadorMetricasFiltros'
import { TrabajadorMetricasTabla } from './TrabajadorMetricasTabla'

interface TrabajadorMetricasModalProps {
  state: TrabajadorMetricasModalState
  actions: TrabajadorMetricasModalActions
}

export function TrabajadorMetricasModal({ state, actions }: TrabajadorMetricasModalProps) {
  const { trabajador, isOpen, filtros, aniosDisponibles, metricasPorLabor, totales, isLoading } = state
  const trabajadorNombre = trabajador?.nombreCompleto ?? 'Metricas del trabajador'
  const descargarPdf = useDescargarMetricasTrabajadorPdf({ trabajadorNombre, metricasPorLabor, totales })
  const cantidadesPorUnidad = agruparCantidadPorUnidad(metricasPorLabor)

  return (
    <Modal isOpen={isOpen} title={trabajadorNombre} onClose={actions.onClose} size="lg">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TrabajadorMetricasFiltros
            filtros={filtros}
            aniosDisponibles={aniosDisponibles}
            onFiltroChange={actions.onFiltroChange}
            onResetFiltros={actions.onResetFiltros}
          />
          <DescargarMetricasPdfButton disabled={isLoading} onDescargar={descargarPdf.descargar} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardKpiCard icon={Clock} etiqueta="Horas totales" valor={totales.horas.toLocaleString('es-CL')} />
          {cantidadesPorUnidad.map((item) => (
            <DashboardKpiCard
              key={item.unidadMedida}
              icon={Package}
              etiqueta={`Cantidad total de ${item.unidadMedida}`}
              valor={item.cantidad.toLocaleString('es-CL')}
            />
          ))}
          <DashboardKpiCard icon={TrendingUp} etiqueta="Productividad promedio" valor={totales.productividad.toFixed(1)} />
          <DashboardKpiCard icon={Zap} etiqueta="Horas extra" valor={`${totales.horasExtra.toLocaleString('es-CL')} h`} />
        </div>

        {isLoading ? <p className="font-bold text-slate-500">Cargando métricas.</p> : <TrabajadorMetricasTabla metricas={metricasPorLabor} />}
      </div>
    </Modal>
  )
}
