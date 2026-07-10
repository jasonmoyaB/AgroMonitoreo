import { CalendarX2 } from 'lucide-react'
import type { Ausencia, Trabajador } from '../../../shared/types/domain.types'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

interface AusenciasTrabajadorPanelProps {
  trabajador: Trabajador | null
  ausencias: readonly Ausencia[]
  isLoading: boolean
}

export function AusenciasTrabajadorPanel({ trabajador, ausencias, isLoading }: AusenciasTrabajadorPanelProps) {
  return (
    <div className="space-y-6">
      <p className="font-bold leading-7 text-slate-600">Dias registrados como ausente/no vino para {trabajador?.nombreCompleto ?? 'el trabajador'}.</p>
      <ResumenAusencias ausencias={ausencias} isLoading={isLoading} />
    </div>
  )
}

interface ResumenAusenciasProps {
  ausencias: readonly Ausencia[]
  isLoading: boolean
}

function ResumenAusencias({ ausencias, isLoading }: ResumenAusenciasProps) {
  if (isLoading) return <p className="neu-pressed rounded-3xl p-4 font-black text-slate-700">Cargando dias registrados.</p>
  if (!ausencias.length) return <p className="neu-pressed rounded-3xl p-4 font-bold text-slate-600">Este trabajador no tiene dias ausente/no vino registrados.</p>

  return (
    <section className="neu-pressed rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-black text-slate-900">Dias ausente / no vino</h3>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">{ausencias.length} total</span>
      </div>
      <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {ausencias.map((ausencia) => (
          <li key={ausencia.id} className="flex items-center gap-3 rounded-2xl bg-white/55 px-3 py-3 font-bold text-slate-700">
            <CalendarX2 className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
            <span className="capitalize">{formatearFecha(ausencia.fecha)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatearFecha(fecha: string): string {
  return FORMATO_FECHA.format(new Date(`${fecha}T00:00:00`))
}
