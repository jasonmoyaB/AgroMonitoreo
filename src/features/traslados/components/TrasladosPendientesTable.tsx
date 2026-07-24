import type { Traslado } from '../types/traslado.types'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

interface TrasladosPendientesTableProps {
  pendientes: readonly Traslado[]
  isLoading: boolean
  resolviendoId: string | null
  onAprobar: (id: string) => void
  onRechazar: (id: string) => void
}

export function TrasladosPendientesTable({ pendientes, isLoading, resolviendoId, onAprobar, onRechazar }: TrasladosPendientesTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando solicitudes.</p>
  if (!pendientes.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">No hay solicitudes pendientes.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Día
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Trabajador
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                De → A
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((traslado) => {
              const resolviendo = resolviendoId === traslado.id
              return (
                <tr key={traslado.id} className="border-b border-slate-900/5 last:border-b-0">
                  <td className="px-5 py-3 font-bold capitalize text-slate-700">{FORMATO_FECHA.format(new Date(`${traslado.fecha}T00:00:00`))}</td>
                  <td className="px-5 py-3 font-black text-slate-900">{traslado.trabajadorNombre}</td>
                  <td className="px-5 py-3 font-bold text-slate-700">
                    {traslado.fincaOrigenNombre} → {traslado.fincaDestinoNombre}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={resolviendo}
                        onClick={() => onAprobar(traslado.id)}
                        className="min-h-11 cursor-pointer rounded-xl bg-green-700 px-4 text-sm font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        disabled={resolviendo}
                        onClick={() => onRechazar(traslado.id)}
                        className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-4 text-sm font-black text-white shadow-lg shadow-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
