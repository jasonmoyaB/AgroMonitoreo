import { ArrowLeftRight, CircleCheckBig, TriangleAlert } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import type { TrabajadorDisponible } from '../types/trabajador-disponible.types'

export type EstadoWorkerCard = 'pendiente' | 'registrado'
export type AvisoWorkerCard = { tipo: 'ausente' } | { tipo: 'traslado'; fincaDestino: string } | null

interface WorkerCardProps {
  id?: string
  trabajador: TrabajadorDisponible
  estado: EstadoWorkerCard
  aviso: AvisoWorkerCard
  onClick: () => void
}

export function WorkerCard({ id, trabajador, estado, aviso, onClick }: WorkerCardProps) {
  return (
    <div id={id} className="neu-raised overflow-hidden rounded-2xl transition-opacity duration-150">
      <button
        type="button"
        onClick={onClick}
        className="relative flex min-h-[88px] w-full cursor-pointer flex-col items-center gap-2 p-4 transition-[transform,box-shadow] duration-150 hover:scale-[1.02] active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
      >
        {estado === 'registrado' && (
          <span className="neu-raised-sm absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full">
            <CircleCheckBig className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          </span>
        )}
        <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} />
        <span className="text-center text-lg font-semibold text-slate-800">{trabajador.nombreCompleto}</span>
        {trabajador.fincaOrigenNombre && <MensajePrestado fincaOrigenNombre={trabajador.fincaOrigenNombre} />}
        {aviso?.tipo === 'traslado' && <MensajeTraslado fincaDestino={aviso.fincaDestino} />}
        {aviso?.tipo === 'ausente' && <MensajeAusente />}
      </button>
    </div>
  )
}

function MensajePrestado({ fincaOrigenNombre }: { fincaOrigenNombre: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-900">
      <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
      De {fincaOrigenNombre}
    </span>
  )
}

function MensajeTraslado({ fincaDestino }: { fincaDestino: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-900">
      <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
      De traslado en {fincaDestino}
    </span>
  )
}

function MensajeAusente() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
      <TriangleAlert className="h-4 w-4" aria-hidden="true" />
      Ausente hoy
    </span>
  )
}
