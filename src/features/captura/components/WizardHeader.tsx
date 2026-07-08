import { ChevronLeft } from 'lucide-react'
import { WizardProgressDots } from './WizardProgressDots'

interface WizardHeaderProps {
  paso: number
  totalPasos: number
  titulo: string
  onAtras: () => void
}

export function WizardHeader({ paso, totalPasos, titulo, onAtras }: WizardHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAtras}
          aria-label="Volver al paso anterior"
          className="neu-raised flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl text-slate-700 transition-all duration-150 active:neu-pressed active:scale-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>
        <WizardProgressDots paso={paso} totalPasos={totalPasos} />
      </div>
      <h1 className="text-center text-2xl font-black text-slate-800">{titulo}</h1>
    </header>
  )
}
