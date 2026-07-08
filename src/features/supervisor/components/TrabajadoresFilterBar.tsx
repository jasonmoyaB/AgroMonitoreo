import { Search } from 'lucide-react'
import type { Finca } from '../../../shared/types/domain.types'
import { FINCA_FILTRO_TODAS } from '../../trabajadores/constants/trabajador-filtro.constants'
import type { EstadoFiltro, TrabajadoresFiltros } from '../../trabajadores/types/trabajador-filtro.types'

const OPCIONES_ESTADO: { valor: EstadoFiltro; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'inactivo', etiqueta: 'Inactivos' },
]

interface TrabajadoresFilterBarProps {
  filtros: TrabajadoresFiltros
  fincas: readonly Finca[]
  onFiltroChange: <K extends keyof TrabajadoresFiltros>(campo: K, valor: TrabajadoresFiltros[K]) => void
}

export function TrabajadoresFilterBar({ filtros, fincas, onFiltroChange }: TrabajadoresFilterBarProps) {
  return (
    <div className="neu-raised mb-4 flex flex-col gap-3 rounded-[2rem] p-4 sm:flex-row sm:items-center">
      <label className="neu-pressed flex min-h-14 flex-1 items-center gap-2 rounded-2xl px-4">
        <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Buscar por nombre</span>
        <input
          value={filtros.nombre}
          onChange={(event) => onFiltroChange('nombre', event.target.value)}
          placeholder="Buscar por nombre"
          className="min-w-0 flex-1 bg-transparent font-bold text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-500"
        />
      </label>

      <div className="flex gap-2" role="group" aria-label="Filtrar por estado">
        {OPCIONES_ESTADO.map((opcion) => (
          <button key={opcion.valor} type="button" onClick={() => onFiltroChange('estado', opcion.valor)} className={crearEstadoClass(filtros.estado === opcion.valor)}>
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <label className="flex min-h-14 items-center">
        <span className="sr-only">Filtrar por finca</span>
        <select
          value={filtros.fincaId}
          onChange={(event) => onFiltroChange('fincaId', event.target.value)}
          className="neu-pressed min-h-14 w-full cursor-pointer rounded-2xl px-4 font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 sm:w-auto"
        >
          <option value={FINCA_FILTRO_TODAS}>Todas las fincas</option>
          {fincas.map((finca) => (
            <option key={finca.id} value={finca.id}>
              {finca.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function crearEstadoClass(isSelected: boolean) {
  const selectedClass = isSelected ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'neu-pressed text-slate-700'
  return `min-h-14 cursor-pointer whitespace-nowrap rounded-2xl px-4 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${selectedClass}`
}
