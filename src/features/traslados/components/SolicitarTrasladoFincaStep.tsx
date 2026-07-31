import { ArrowRight, Warehouse } from 'lucide-react'

interface FincaDisponible {
  fincaId: string
  fincaNombre: string
  cantidad: number
}

interface SolicitarTrasladoFincaStepProps {
  fincas: readonly FincaDisponible[]
  isLoading: boolean
  onElegir: (fincaId: string) => void
}

export function SolicitarTrasladoFincaStep({ fincas, isLoading, onElegir }: SolicitarTrasladoFincaStepProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando fincas.</p>
  if (!fincas.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No hay trabajadores disponibles en otras fincas.</p>

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {fincas.map((finca) => (
        <button
          key={finca.fincaId}
          type="button"
          onClick={() => onElegir(finca.fincaId)}
          className="neu-raised-sm flex min-h-24 w-full cursor-pointer items-center gap-4 rounded-3xl p-4 text-left transition-transform duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
            <Warehouse className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-black text-slate-900">{finca.fincaNombre}</span>
            <span className="block text-sm font-bold text-slate-600">{finca.cantidad} trabajador(es) disponibles</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-green-800" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
