import type { Finca } from '../../../shared/types/domain.types'

interface FincaSelectorProps {
  fincas: readonly Finca[]
  fincaSeleccionadaId: string | null
  onSeleccionar: (fincaId: string) => void
}

export function FincaSelector({ fincas, fincaSeleccionadaId, onSeleccionar }: FincaSelectorProps) {
  if (!fincas.length) return null

  return (
    <div role="tablist" aria-label="Seleccionar finca" className="mb-4 flex flex-wrap gap-2">
      {fincas.map((finca) => {
        const isActive = finca.id === fincaSeleccionadaId

        return (
          <button
            key={finca.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSeleccionar(finca.id)}
            className={`min-h-11 cursor-pointer rounded-2xl px-4 text-sm font-black transition-colors duration-200 ${
              isActive ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-pressed text-slate-700'
            }`}
          >
            {finca.nombre}
          </button>
        )
      })}
    </div>
  )
}
