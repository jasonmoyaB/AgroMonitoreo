import { WorkerCard } from './WorkerCard'
import type { RegistroTrabajo, Trabajador } from '../../../shared/types/domain.types'

interface WorkersGridProps {
  trabajadores: readonly Trabajador[]
  registrosDelDia: readonly RegistroTrabajo[]
  tipoLaborId: string
  onSeleccionar: (trabajador: Trabajador) => void
}

export function WorkersGrid({ trabajadores, registrosDelDia, tipoLaborId, onSeleccionar }: WorkersGridProps) {
  const idsRegistrados = new Set(
    registrosDelDia.flatMap((registro) => (registro.tipoLaborId === tipoLaborId ? [registro.trabajadorId] : []))
  )

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {trabajadores.map((trabajador) => (
        <WorkerCard
          key={trabajador.id}
          trabajador={trabajador}
          yaRegistrado={idsRegistrados.has(trabajador.id)}
          onClick={() => onSeleccionar(trabajador)}
        />
      ))}
    </div>
  )
}
