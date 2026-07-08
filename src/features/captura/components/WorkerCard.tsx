import { CircleCheckBig } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

interface WorkerCardProps {
  trabajador: Trabajador
  yaRegistrado: boolean
  onClick: () => void
}

export function WorkerCard({ trabajador, yaRegistrado, onClick }: WorkerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="neu-raised relative flex min-h-[88px] cursor-pointer flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-150 hover:scale-[1.04] active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
    >
      {yaRegistrado && (
        <span className="neu-raised-sm absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full">
          <CircleCheckBig className="h-6 w-6 text-emerald-600" aria-hidden="true" />
        </span>
      )}
      <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} />
      <span className="text-center text-lg font-semibold text-slate-800">{trabajador.nombreCompleto}</span>
    </button>
  )
}
