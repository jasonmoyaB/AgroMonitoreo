import { LaborTaskCard } from './LaborTaskCard'
import type { LaborTask } from '../types/supervisor-dashboard.types'
import type { TipoLabor } from '../../../shared/types/domain.types'

interface LaborTaskListProps {
  labores: readonly LaborTask[]
  onSelect: (tipoLabor: TipoLabor) => void
}

export function LaborTaskList({ labores, onSelect }: LaborTaskListProps) {
  return (
    <div className="grid gap-3 pb-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {labores.map((labor) => (
        <LaborTaskCard key={labor.id} labor={labor} onSelect={onSelect} />
      ))}
    </div>
  )
}
