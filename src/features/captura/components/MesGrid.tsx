import { MESES } from '../constants/meses.constants'

interface MesGridProps {
  mesSeleccionado: number
  onSeleccionar: (mes: number) => void
}

export function MesGrid({ mesSeleccionado, onSeleccionar }: MesGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4">
      {MESES.map((mesOpcion) => {
        const estaSeleccionado = mesOpcion.valor === mesSeleccionado
        return (
          <button
            key={mesOpcion.valor}
            type="button"
            onClick={() => onSeleccionar(mesOpcion.valor)}
            className={`neu-raised flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-all duration-150 hover:scale-[1.04] active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${
              estaSeleccionado ? 'ring-4 ring-emerald-500' : ''
            }`}
          >
            <span className="text-xl font-black text-slate-800">{mesOpcion.abreviatura}</span>
          </button>
        )
      })}
    </div>
  )
}
