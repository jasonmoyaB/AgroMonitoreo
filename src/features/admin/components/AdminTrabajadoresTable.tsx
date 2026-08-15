import { Eye } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import { BOTON_EDITAR, BOTON_TABLA, BOTON_VER } from '../../../shared/constants/botones-tabla.constants'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40
const BADGE_CLASS = 'inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide'

interface AdminTrabajadoresTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  onVer: (trabajador: Trabajador) => void
  onSelectTrabajador: (trabajador: Trabajador) => void
  onEditarSeguro: (trabajador: Trabajador) => void
}

export function AdminTrabajadoresTable({ trabajadores, isLoading, onVer, onSelectTrabajador, onEditarSeguro }: AdminTrabajadoresTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando trabajadores.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Esta finca no tiene trabajadores registrados.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-left">
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
              <tr key={trabajador.id} className="border-b border-slate-900/5 last:border-b-0 hover:bg-white/45">
                <td className="px-5 py-3">
                  {/* el nombre es el control accesible de la fila: un onClick en el <tr> no lo
                      alcanza el teclado, y ademas obliga a stopPropagation en cada boton */}
                  <button
                    type="button"
                    onClick={() => onSelectTrabajador(trabajador)}
                    className="flex min-w-0 cursor-pointer items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                  >
                    <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
                    <span className="truncate text-base font-black text-slate-900">{trabajador.nombreCompleto}</span>
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`${BADGE_CLASS} ${trabajador.activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                      {trabajador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`${BADGE_CLASS} ${trabajador.asegurado ? 'bg-indigo-100 text-indigo-900' : 'bg-amber-100 text-amber-900'}`}>
                      {trabajador.asegurado ? 'Asegurado' : 'No asegurado'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => onVer(trabajador)} className={`${BOTON_TABLA} ${BOTON_VER}`}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Ver
                    </button>
                    <button type="button" onClick={() => onEditarSeguro(trabajador)} className={`${BOTON_TABLA} ${BOTON_EDITAR}`}>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
