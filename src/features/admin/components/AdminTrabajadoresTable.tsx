import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40

interface AdminTrabajadoresTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
}

export function AdminTrabajadoresTable({ trabajadores, isLoading }: AdminTrabajadoresTableProps) {
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
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <tr key={trabajador.id} className="border-b border-slate-900/5 last:border-b-0">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
