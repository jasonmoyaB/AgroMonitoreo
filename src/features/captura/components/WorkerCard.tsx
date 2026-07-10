import { CircleCheckBig, UserX } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

export type EstadoWorkerCard = 'pendiente' | 'registrado' | 'ausente'

interface WorkerCardProps {
  id?: string
  trabajador: Trabajador
  estado: EstadoWorkerCard
  onClick: () => void
  onToggleAusente: () => void
}

export function WorkerCard({ id, trabajador, estado, onClick, onToggleAusente }: WorkerCardProps) {
  const esAusente = estado === 'ausente'

  return (
    <div id={id} className="neu-raised flex flex-col gap-2 overflow-hidden rounded-2xl transition-opacity duration-150">
      <button
        type="button"
        onClick={onClick}
        disabled={esAusente}
        className={`relative flex min-h-[88px] w-full cursor-pointer flex-col items-center gap-2 p-4 transition-all duration-150 hover:scale-[1.02] active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed ${esAusente ? 'opacity-40' : ''}`}
      >
        {estado === 'registrado' && (
          <span className="neu-raised-sm absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full">
            <CircleCheckBig className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          </span>
        )}
        <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} />
        <span className="text-center text-lg font-semibold text-slate-800">{trabajador.nombreCompleto}</span>
      </button>

      <button
        type="button"
        onClick={onToggleAusente}
        aria-pressed={esAusente}
        className={`flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 border-t px-2 py-2 text-sm font-semibold transition-colors duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-slate-700 ${
          esAusente ? 'border-rose-200 bg-rose-100 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
        }`}
      >
        <UserX className="h-4 w-4" aria-hidden="true" />
        {esAusente ? 'Ausente' : 'Marcar ausente'}
      </button>
    </div>
  )
}
