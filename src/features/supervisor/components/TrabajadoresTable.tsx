import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40

interface TrabajadoresTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  onEdit: (trabajador: Trabajador) => void
  onToggleActive: (trabajador: Trabajador) => void
}

export function TrabajadoresTable({ trabajadores, isLoading, onEdit, onToggleActive }: TrabajadoresTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando trabajadores.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No se encontraron trabajadores.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Trabajador
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Estado
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <TrabajadoresTableRow key={trabajador.id} trabajador={trabajador} onEdit={onEdit} onToggleActive={onToggleActive} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface TrabajadoresTableRowProps {
  trabajador: Trabajador
  onEdit: (trabajador: Trabajador) => void
  onToggleActive: (trabajador: Trabajador) => void
}

function TrabajadoresTableRow({ trabajador, onEdit, onToggleActive }: TrabajadoresTableRowProps) {
  return (
    <tr className="border-b border-slate-900/5 last:border-b-0 hover:bg-white/45">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
          <span className="truncate text-base font-black text-slate-900">{trabajador.nombreCompleto}</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide ${
            trabajador.activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {trabajador.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onEdit(trabajador)} className="neu-pressed min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black text-slate-800">
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleActive(trabajador)}
            className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black text-white shadow-lg ${
              trabajador.activo ? 'bg-red-700 shadow-red-900/20' : 'bg-green-700 shadow-green-900/20'
            }`}
          >
            {trabajador.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </td>
    </tr>
  )
}
