import { RANGOS_ALFABETO, type RangoLetras } from '../constants/rangos-alfabeto.constants'

interface AlfabetoIndiceProps {
  onSeleccionarRango: (rango: RangoLetras) => void
}

export function AlfabetoIndice({ onSeleccionarRango }: AlfabetoIndiceProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Saltar a un rango de nombres">
      {RANGOS_ALFABETO.map((rango) => (
        <button
          key={rango.etiqueta}
          type="button"
          onClick={() => onSeleccionarRango(rango)}
          className="neu-raised min-h-12 shrink-0 cursor-pointer rounded-xl px-5 text-base font-black text-slate-700 transition-all duration-150 active:neu-pressed active:scale-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          {rango.etiqueta}
        </button>
      ))}
    </nav>
  )
}
