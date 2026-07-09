import { WorkerCard } from './WorkerCard'
import type { Trabajador } from '../../../shared/types/domain.types'

interface WorkersGridProps {
  trabajadores: readonly Trabajador[]
  idsRegistrados: ReadonlySet<string>
  onSeleccionar: (trabajador: Trabajador) => void
}

export function WorkersGrid({ trabajadores, idsRegistrados, onSeleccionar }: WorkersGridProps) {
  if (trabajadores.length === 0) {
    return <p className="p-8 text-center text-lg font-semibold text-slate-500">Sin resultados</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {trabajadores.map((trabajador) => (
        <WorkerCard
          key={trabajador.id}
          id={`trabajador-${trabajador.id}`}
          trabajador={trabajador}
          yaRegistrado={idsRegistrados.has(trabajador.id)}
          onClick={() => onSeleccionar(trabajador)}
        />
      ))}
    </div>
  )
}
