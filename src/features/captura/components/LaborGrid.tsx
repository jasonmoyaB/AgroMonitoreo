import { IconTile } from '../../../shared/components/IconTile'
import { LaborIcon } from '../../../shared/components/LaborIcon'
import type { TipoLabor } from '../../../shared/types/domain.types'

interface LaborGridProps {
  tiposLabor: readonly TipoLabor[]
  onSeleccionar: (tipoLabor: TipoLabor) => void
}

export function LaborGrid({ tiposLabor, onSeleccionar }: LaborGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {tiposLabor.map((tipoLabor) => (
        <IconTile
          key={tipoLabor.id}
          icon={<LaborIcon name={tipoLabor.icono} className="h-full w-full" />}
          label={tipoLabor.nombre}
          color={tipoLabor.color}
          onClick={() => onSeleccionar(tipoLabor)}
        />
      ))}
    </div>
  )
}
