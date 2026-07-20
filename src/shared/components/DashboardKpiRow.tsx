import { Clock, Package, TrendingUp, Users } from 'lucide-react'
import { DashboardKpiCard } from './DashboardKpiCard'
import { capitalizar } from '../utils/capitalizar'
import type { DashboardKpis } from '../types/kpis.types'

interface DashboardKpiRowProps {
  kpis: DashboardKpis
}

export function DashboardKpiRow({ kpis }: DashboardKpiRowProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
      <DashboardKpiCard icon={Clock} etiqueta="Horas del mes" valor={kpis.totalHoras.toLocaleString('es-CL')} />
      <DashboardKpiCard icon={Users} etiqueta="Trabajadores activos" valor={String(kpis.trabajadoresActivos)} />
      {kpis.cantidadesPorUnidad.map((cantidadPorUnidad) => (
        <DashboardKpiCard
          key={cantidadPorUnidad.unidad}
          icon={Package}
          etiqueta={`${capitalizar(cantidadPorUnidad.unidad)} producidos`}
          valor={cantidadPorUnidad.totalCantidad.toLocaleString('es-CL')}
        />
      ))}
      {kpis.cantidadesPorUnidad.map((cantidadPorUnidad) => (
        <DashboardKpiCard
          key={`productividad-${cantidadPorUnidad.unidad}`}
          icon={TrendingUp}
          etiqueta={`Productividad (${cantidadPorUnidad.unidad}/hora)`}
          valor={cantidadPorUnidad.productividadPromedio.toFixed(1)}
        />
      ))}
    </div>
  )
}
