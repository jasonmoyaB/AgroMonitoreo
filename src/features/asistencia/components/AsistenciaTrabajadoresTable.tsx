import { CalendarPlus, Eye } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40

interface AsistenciaTrabajadoresTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  onVer: (trabajador: Trabajador) => void
  onAgregar: (trabajador: Trabajador) => void
}

export function AsistenciaTrabajadoresTable({ trabajadores, isLoading, onVer, onAgregar }: AsistenciaTrabajadoresTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando trabajadores.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No se encontraron trabajadores.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left">
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
              <AsistenciaTrabajadorRow key={trabajador.id} trabajador={trabajador} onVer={onVer} onAgregar={onAgregar} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface AsistenciaTrabajadorRowProps {
  trabajador: Trabajador
  onVer: (trabajador: Trabajador) => void
  onAgregar: (trabajador: Trabajador) => void
}

function AsistenciaTrabajadorRow({ trabajador, onVer, onAgregar }: AsistenciaTrabajadorRowProps) {
  return (
    <tr className="border-b border-slate-900/5 last:border-b-0 hover:bg-white/45">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
          <span className="truncate text-base font-black text-slate-900">{trabajador.nombreCompleto}</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide ${trabajador.activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
          {trabajador.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-2">
        <button type="button" onClick={() => onVer(trabajador)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white shadow-lg shadow-slate-900/15">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Ver
        </button>
        <button type="button" onClick={() => onAgregar(trabajador)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-black text-white shadow-lg shadow-green-900/20">
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Agregar
        </button>
        </div>
      </td>
    </tr>
  )
}
