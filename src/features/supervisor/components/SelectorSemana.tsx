import { ChevronLeft, ChevronRight } from 'lucide-react'

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
        className="neu-pressed flex min-h-14 min-w-14 cursor-pointer items-center justify-center rounded-2xl text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <span className="text-center text-base font-black capitalize text-slate-900 sm:text-lg">{etiqueta}</span>

      <button
        type="button"
        onClick={onSiguiente}
        disabled={deshabilitarSiguiente}
        aria-label="Semana siguiente"
        className="neu-pressed flex min-h-14 min-w-14 cursor-pointer items-center justify-center rounded-2xl text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
