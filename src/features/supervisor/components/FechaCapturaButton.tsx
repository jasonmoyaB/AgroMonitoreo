import { CalendarDays } from 'lucide-react'

interface FechaCapturaButtonProps {
  fecha: string
  esHoy: boolean
  onClick: () => void
}

export function FechaCapturaButton({ fecha, esHoy, onClick }: FechaCapturaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Registrando el ${fecha}. Toca para cambiar la fecha`}
      className={`neu-raised flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 font-black capitalize transition-[transform,box-shadow] duration-150 active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${
        esHoy ? 'text-slate-700' : 'text-amber-700 ring-4 ring-amber-400'
      }`}
    >
      <CalendarDays className={`h-5 w-5 shrink-0 ${esHoy ? 'text-green-800' : 'text-amber-600'}`} aria-hidden="true" />
      {fecha}
    </button>
  )
}
