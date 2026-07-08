import type { Trabajador } from '../../../shared/types/domain.types'

interface TrabajadoresListProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  onEdit: (trabajador: Trabajador) => void
  onToggleActive: (trabajador: Trabajador) => void
}

export function TrabajadoresList({ trabajadores, isLoading, onEdit, onToggleActive }: TrabajadoresListProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando trabajadores.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No hay trabajadores registrados.</p>

  return (
    <div className="grid gap-3">
      {trabajadores.map((trabajador) => (
        <article key={trabajador.id} className="neu-raised-sm grid gap-3 rounded-3xl p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-slate-900">{trabajador.nombreCompleto}</h3>
            <p className={`mt-1 text-sm font-black ${trabajador.activo ? 'text-green-800' : 'text-slate-500'}`}>{trabajador.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onEdit(trabajador)} className="neu-pressed min-h-12 cursor-pointer rounded-2xl px-4 font-black text-slate-800">
              Editar
            </button>
            <button type="button" onClick={() => onToggleActive(trabajador)} className="min-h-12 cursor-pointer rounded-2xl bg-green-700 px-4 font-black text-white shadow-lg shadow-green-900/20">
              {trabajador.activo ? 'Inactivar' : 'Activar'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
