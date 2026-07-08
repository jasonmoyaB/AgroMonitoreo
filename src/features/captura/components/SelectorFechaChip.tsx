import { CalendarDays } from 'lucide-react'
import { formatearFechaCorta } from '../utils/formatear-fecha-corta'

interface SelectorFechaChipProps {
  fecha: string
  onClick: () => void
}

export function SelectorFechaChip({ fecha, onClick }: SelectorFechaChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cambiar la fecha del registro"
      className="neu-raised flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 text-slate-800 transition-transform duration-200 active:scale-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-white">
        <CalendarDays className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-black capitalize">{formatearFechaCorta(fecha)}</span>
    </button>
  )
}
