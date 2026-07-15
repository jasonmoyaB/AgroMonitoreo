import type { Supervisor } from '../types/supervisor.types'

interface SupervisoresTableProps {
  supervisores: readonly Supervisor[]
  isLoading: boolean
  onEdit: (supervisor: Supervisor) => void
  onToggleActive: (supervisor: Supervisor) => void
}

export function SupervisoresTable({ supervisores, isLoading, onEdit, onToggleActive }: SupervisoresTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando supervisores.</p>
  if (!supervisores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No hay supervisores registrados.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Supervisor
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Finca
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
            {supervisores.map((supervisor) => (
              <tr key={supervisor.id} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3">
                  <span className="block truncate text-base font-black text-slate-900">{supervisor.nombre || supervisor.email}</span>
                  <span className="block text-xs font-bold text-slate-500">{supervisor.email}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex min-h-8 items-center rounded-full bg-slate-200 px-3 text-xs font-black uppercase tracking-wide text-slate-700">
                    {supervisor.fincaNombre}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide ${
                      supervisor.activo ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {supervisor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(supervisor)}
                      className="neu-pressed min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black text-slate-800"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(supervisor)}
                      className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black text-white shadow-lg ${
                        supervisor.activo ? 'bg-red-700 shadow-red-900/20' : 'bg-green-700 shadow-green-900/20'
                      }`}
                    >
                      {supervisor.activo ? 'Desactivar' : 'Activar'}
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
