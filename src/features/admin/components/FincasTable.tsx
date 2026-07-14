import type { Finca } from '../../../shared/types/domain.types'

interface FincasTableProps {
  fincas: readonly Finca[]
  isLoading: boolean
  onToggleActive: (finca: Finca) => void
}

export function FincasTable({ fincas, isLoading, onToggleActive }: FincasTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando fincas.</p>
  if (!fincas.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No hay fincas registradas.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
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
            {fincas.map((finca) => (
              <tr key={finca.id} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3">
                  <span className="block truncate text-base font-black text-slate-900">{finca.nombre}</span>
                  <span className="block text-xs font-bold text-slate-500">{finca.id}</span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase tracking-wide ${
                      finca.activa ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {finca.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onToggleActive(finca)}
                      className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black text-white shadow-lg ${
                        finca.activa ? 'bg-red-700 shadow-red-900/20' : 'bg-green-700 shadow-green-900/20'
                      }`}
                    >
                      {finca.activa ? 'Desactivar' : 'Activar'}
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
