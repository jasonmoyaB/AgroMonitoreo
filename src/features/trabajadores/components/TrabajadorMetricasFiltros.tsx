import type { TrabajadorMetricasFiltros as Filtros } from '../types/trabajador-metricas.types'

interface TrabajadorMetricasFiltrosProps {
  filtros: Filtros
  aniosDisponibles: number[]
  onFiltroChange: <K extends keyof Filtros>(campo: K, valor: Filtros[K]) => void
  onResetFiltros: () => void
}

export function TrabajadorMetricasFiltros({ filtros, aniosDisponibles, onFiltroChange, onResetFiltros }: TrabajadorMetricasFiltrosProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="neu-pressed flex min-h-14 flex-1 items-center gap-2 rounded-2xl px-4">
        <span className="text-xs font-black uppercase tracking-wide text-slate-600">Año</span>
        <select
          value={filtros.anio ?? ''}
          onChange={(event) => onFiltroChange('anio', event.target.value ? Number(event.target.value) : null)}
          className="min-w-0 flex-1 cursor-pointer bg-transparent text-lg font-bold text-slate-900 outline-none"
        >
          <option value="">Todos</option>
          {aniosDisponibles.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>
      </label>

      <label className="neu-pressed flex min-h-14 flex-1 items-center gap-2 rounded-2xl px-4">
        <span className="text-xs font-black uppercase tracking-wide text-slate-600">Desde</span>
        <input
          type="date"
          value={filtros.fechaInicio ?? ''}
          onChange={(event) => onFiltroChange('fechaInicio', event.target.value || null)}
          className="min-w-0 flex-1 bg-transparent text-lg font-bold text-slate-900 outline-none"
        />
      </label>

      <label className="neu-pressed flex min-h-14 flex-1 items-center gap-2 rounded-2xl px-4">
        <span className="text-xs font-black uppercase tracking-wide text-slate-600">Hasta</span>
        <input
          type="date"
          value={filtros.fechaFin ?? ''}
          onChange={(event) => onFiltroChange('fechaFin', event.target.value || null)}
          className="min-w-0 flex-1 bg-transparent text-lg font-bold text-slate-900 outline-none"
        />
      </label>

      <button
        type="button"
        onClick={onResetFiltros}
        className="neu-pressed min-h-14 shrink-0 cursor-pointer rounded-2xl px-5 text-base font-black text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
      >
        Limpiar
      </button>
    </div>
  )
}
