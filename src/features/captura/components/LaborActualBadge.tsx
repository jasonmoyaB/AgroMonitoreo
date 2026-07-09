import { LaborIcon } from '../../../shared/components/LaborIcon'
import type { LaborIconName } from '../../../shared/types/domain.types'

interface LaborActualBadgeProps {
  icono: LaborIconName
  nombre: string
  color: string
}

export function LaborActualBadge({ icono, nombre, color }: LaborActualBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-base font-bold text-slate-700 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.6)]">
      <LaborIcon name={icono} className="h-5 w-5" style={{ color }} />
      {nombre}
    </div>
  )
}
