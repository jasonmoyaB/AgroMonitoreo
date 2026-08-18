import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BOTON_ICONO } from '../constants/botones.constants'

interface SelectorSemanaProps {
  etiqueta: string
  deshabilitarSiguiente: boolean
  onAnterior: () => void
  onSiguiente: () => void
}

export function SelectorSemana({ etiqueta, deshabilitarSiguiente, onAnterior, onSiguiente }: SelectorSemanaProps) {
  return (
    <div className="neu-raised mb-4 flex items-center justify-between gap-3 rounded-[2rem] p-4">
      <button
        type="button"
        onClick={onAnterior}
        aria-label="Semana anterior"
        className={BOTON_ICONO}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <span className="text-center text-base font-black capitalize text-slate-900 sm:text-lg">{etiqueta}</span>

      <button
        type="button"
        onClick={onSiguiente}
        disabled={deshabilitarSiguiente}
        aria-label="Semana siguiente"
        className={BOTON_ICONO}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
