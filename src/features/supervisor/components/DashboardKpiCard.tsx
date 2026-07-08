import type { LucideIcon } from 'lucide-react'

interface DashboardKpiCardProps {
  icon: LucideIcon
  etiqueta: string
  valor: string
}

export function DashboardKpiCard({ icon: Icon, etiqueta, valor }: DashboardKpiCardProps) {
  return (
    <div className="neu-raised flex min-h-24 items-center gap-3 rounded-3xl p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-600">{etiqueta}</span>
        <span className="block text-xl font-black tracking-tight text-slate-900">{valor}</span>
      </span>
    </div>
  )
}
