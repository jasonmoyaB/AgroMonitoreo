import { Search, X } from 'lucide-react'
import { BOTON_NEUTRO } from '../../../shared/constants/botones.constants'
import { crearClaseToggle } from '../../../shared/utils/crear-clase-toggle'
import type { EstadoFiltro, TrabajadoresFiltros } from '../types/trabajador-filtro.types'

const OPCION_TODOS: { valor: EstadoFiltro; etiqueta: string } = { valor: 'todos', etiqueta: 'Todos' }

const OPCIONES_ESTADO: { valor: EstadoFiltro; etiqueta: string }[] = [
  OPCION_TODOS,
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'inactivo', etiqueta: 'Inactivos' },
]

const OPCION_AUSENTES: { valor: EstadoFiltro; etiqueta: string } = { valor: 'ausente', etiqueta: 'Ausentes' }

interface TrabajadoresFilterBarProps {
  filtros: TrabajadoresFiltros
  onFiltroChange: <K extends keyof TrabajadoresFiltros>(campo: K, valor: TrabajadoresFiltros[K]) => void
  onResetFiltros: () => void
  mostrarAusentes?: boolean
  onVerAusentes?: () => void
}

export function TrabajadoresFilterBar({ filtros, onFiltroChange, onResetFiltros, mostrarAusentes = false, onVerAusentes }: TrabajadoresFilterBarProps) {
  const opciones = mostrarAusentes ? [OPCION_TODOS, OPCION_AUSENTES] : OPCIONES_ESTADO

  function handleEstadoClick(valor: EstadoFiltro) {
    if (valor === 'ausente' && onVerAusentes) {
      onVerAusentes()
      return
    }
    onFiltroChange('estado', valor)
  }

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
        {opciones.map((opcion) => (
          <button key={opcion.valor} type="button" onClick={() => handleEstadoClick(opcion.valor)} className={crearEstadoClass(filtros.estado === opcion.valor)}>
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onResetFiltros}
        className={`${BOTON_NEUTRO} shrink-0`}
      >
        <X className="h-5 w-5" aria-hidden="true" />
        Borrar filtros
      </button>
    </div>
  )
}

function crearEstadoClass(isSelected: boolean) {
  return crearClaseToggle(isSelected, 'whitespace-nowrap text-sm')
}
