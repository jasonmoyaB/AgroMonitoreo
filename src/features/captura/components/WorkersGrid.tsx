import { WorkerCard, type EstadoWorkerCard } from './WorkerCard'
import type { TrabajadorDisponible } from '../types/trabajador-disponible.types'

interface WorkersGridProps {
  trabajadores: readonly TrabajadorDisponible[]
  idsRegistrados: ReadonlySet<string>
  idsAusentes: ReadonlySet<string>
  onSeleccionar: (trabajador: TrabajadorDisponible) => void
}

export function WorkersGrid({ trabajadores, idsRegistrados, idsAusentes, onSeleccionar }: WorkersGridProps) {
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
          estado={obtenerEstado(trabajador.id, idsRegistrados)}
          estaAusente={idsAusentes.has(trabajador.id)}
          onClick={() => onSeleccionar(trabajador)}
        />
      ))}
    </div>
  )
}

function obtenerEstado(id: string, idsRegistrados: ReadonlySet<string>): EstadoWorkerCard {
  if (idsRegistrados.has(id)) return 'registrado'
  return 'pendiente'
}
