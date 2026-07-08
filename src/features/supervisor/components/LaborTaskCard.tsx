import { ArrowRight, ChevronDown } from 'lucide-react'
import { LaborIcon } from '../../../shared/components/LaborIcon'
import type { TipoLabor } from '../../../shared/types/domain.types'
import type { LaborTask } from '../types/supervisor-dashboard.types'

interface LaborTaskCardProps {
  labor: LaborTask
  onSelect: (tipoLabor: TipoLabor) => void
}

export function LaborTaskCard({ labor, onSelect }: LaborTaskCardProps) {
  const { tipoLabor, opciones } = labor

  if (opciones.length > 1) {
    return <LaborTaskDropdown labor={labor} onSelect={onSelect} />
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(opciones[0].tipoLabor)}
      className="neu-raised-sm flex min-h-24 w-full cursor-pointer items-center gap-4 rounded-3xl p-4 text-left transition-transform duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
    >
      <LaborTaskHeader tipoLabor={tipoLabor} ayuda="Registrar por trabajador" />
      <ArrowRight className="h-5 w-5 shrink-0 text-green-800" aria-hidden="true" />
    </button>
  )
}

function LaborTaskDropdown({ labor, onSelect }: LaborTaskCardProps) {
  const { tipoLabor, opciones } = labor

  return (
    <details className="neu-raised-sm group min-h-24 w-full rounded-3xl p-4">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900">
        <LaborTaskHeader tipoLabor={tipoLabor} ayuda="Tocar y escoger" />
        <ChevronDown className="h-5 w-5 shrink-0 text-green-800" aria-hidden="true" />
      </summary>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {opciones.map((opcion) => (
          <button
            key={opcion.tipoLabor.id}
            type="button"
            onClick={() => onSelect(opcion.tipoLabor)}
            className="neu-pressed min-h-14 cursor-pointer rounded-2xl px-3 text-base font-black text-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </details>
  )
}

function LaborTaskHeader({ tipoLabor, ayuda }: { tipoLabor: TipoLabor; ayuda: string }) {
  return (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: tipoLabor.color }}>
        <LaborIcon name={tipoLabor.icono} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-black text-slate-900">{tipoLabor.nombre}</span>
        <span className="block text-sm font-bold text-slate-600">{ayuda}</span>
      </span>
    </>
  )
}
