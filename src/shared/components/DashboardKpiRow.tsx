import { Clock, Package, TrendingUp, Users } from 'lucide-react'
import { DashboardKpiCard } from './DashboardKpiCard'
import type { DashboardKpis } from '../types/kpis.types'

interface DashboardKpiRowProps {
  kpis: DashboardKpis
}

export function DashboardKpiRow({ kpis }: DashboardKpiRowProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
      <DashboardKpiCard icon={Clock} etiqueta="Horas del mes" valor={kpis.totalHoras.toLocaleString('es-CL')} />
      <DashboardKpiCard icon={Package} etiqueta="Cantidad producida" valor={kpis.totalCantidad.toLocaleString('es-CL')} />
      <DashboardKpiCard icon={TrendingUp} etiqueta="Productividad promedio" valor={kpis.productividadPromedio.toFixed(1)} />
      <DashboardKpiCard icon={Users} etiqueta="Trabajadores activos" valor={String(kpis.trabajadoresActivos)} />
    </div>
  )
}
