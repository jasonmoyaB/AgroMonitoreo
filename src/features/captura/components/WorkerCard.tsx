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
      className="relative flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-md transition-transform active:scale-95"
    >
      {yaRegistrado && (
        <CircleCheckBig className="absolute right-2 top-2 h-8 w-8 text-emerald-500" aria-hidden="true" />
      )}
      <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} />
      <span className="text-center text-lg font-semibold text-slate-800">{trabajador.nombreCompleto}</span>
    </button>
  )
}
