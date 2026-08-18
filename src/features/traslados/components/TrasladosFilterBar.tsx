import { Search, X } from 'lucide-react'
import { BOTON_NEUTRO } from '../../../shared/constants/botones.constants'
import { ESTADOS_TRASLADO, ETIQUETAS_ESTADO_TRASLADO } from '../constants/estado-traslado.constants'
import type { SentidoFiltroTraslado, Traslado, TrasladosFiltros } from '../types/traslado.types'

const SENTIDOS: { valor: SentidoFiltroTraslado; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'recibido', etiqueta: 'Recibidos' },
  { valor: 'prestado', etiqueta: 'Prestados' },
]

const CLASE_CAMPO = 'neu-pressed min-h-14 rounded-2xl px-4 font-bold text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900'

interface TrasladosFilterBarProps {
  filtros: TrasladosFiltros
  /** lista sin filtrar: de ahi salen las opciones de finca y estado */
  traslados: readonly Traslado[]
  fincaPropiaId?: string
  onFiltroChange: <K extends keyof TrasladosFiltros>(campo: K, valor: TrasladosFiltros[K]) => void
  onResetFiltros: () => void
}

export function TrasladosFilterBar({ filtros, traslados, fincaPropiaId = '', onFiltroChange, onResetFiltros }: TrasladosFilterBarProps) {
  const fincas = [...new Set(traslados.flatMap((traslado) => [traslado.fincaOrigenNombre, traslado.fincaDestinoNombre]))].sort()
  const estados = ESTADOS_TRASLADO.filter((estado) => traslados.some((traslado) => traslado.estado === estado))

  return (
    <div className="neu-raised mb-4 flex flex-wrap items-center gap-3 rounded-[2rem] p-4">
      <label className="neu-pressed flex min-h-14 min-w-48 flex-1 items-center gap-2 rounded-2xl px-4">
        <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Buscar por trabajador</span>
        <input
          value={filtros.trabajador}
          onChange={(event) => onFiltroChange('trabajador', event.target.value)}
          placeholder="Buscar por trabajador"
          className="min-w-0 flex-1 bg-transparent font-bold text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-500"
        />
      </label>

      {estados.length > 1 && (
        <Chips
          etiqueta="Filtrar por estado"
          opciones={[{ valor: 'todos', etiqueta: 'Todos' }, ...estados.map((estado) => ({ valor: estado, etiqueta: ETIQUETAS_ESTADO_TRASLADO[estado] }))]}
          valor={filtros.estado}
          onChange={(valor) => onFiltroChange('estado', valor as TrasladosFiltros['estado'])}
        />
      )}

      {fincaPropiaId !== '' && (
        <Chips etiqueta="Filtrar por sentido" opciones={SENTIDOS} valor={filtros.sentido} onChange={(valor) => onFiltroChange('sentido', valor as SentidoFiltroTraslado)} />
      )}

      {fincas.length > 1 && (
        <label className="flex items-center gap-2">
          <span className="sr-only">Filtrar por finca</span>
          <select value={filtros.finca} onChange={(event) => onFiltroChange('finca', event.target.value)} className={`${CLASE_CAMPO} cursor-pointer`}>
            <option value="">Todas las fincas</option>
            {fincas.map((finca) => (
              <option key={finca} value={finca}>
                {finca}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex min-w-0 flex-1 items-center gap-2 font-black text-slate-700">
        Desde
        <input
          type="date"
          value={filtros.desde}
          max={filtros.hasta || undefined}
          onChange={(event) => onFiltroChange('desde', event.target.value)}
          className={`${CLASE_CAMPO} min-w-0 flex-1`}
        />
      </label>

      <label className="flex min-w-0 flex-1 items-center gap-2 font-black text-slate-700">
        Hasta
        <input
          type="date"
          value={filtros.hasta}
          min={filtros.desde || undefined}
          onChange={(event) => onFiltroChange('hasta', event.target.value)}
          className={`${CLASE_CAMPO} min-w-0 flex-1`}
        />
      </label>

      <button type="button" onClick={onResetFiltros} className={`${BOTON_NEUTRO} shrink-0`}>
        <X className="h-5 w-5" aria-hidden="true" />
        Borrar filtros
      </button>
    </div>
  )
}

interface ChipsProps {
  etiqueta: string
  opciones: readonly { valor: string; etiqueta: string }[]
  valor: string
  onChange: (valor: string) => void
}

function Chips({ etiqueta, opciones, valor, onChange }: ChipsProps) {
  return (
    <div className="flex gap-2" role="group" aria-label={etiqueta}>
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          onClick={() => onChange(opcion.valor)}
          className={`min-h-14 cursor-pointer whitespace-nowrap rounded-2xl px-4 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${
            valor === opcion.valor ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-pressed text-slate-700'
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  )
}
