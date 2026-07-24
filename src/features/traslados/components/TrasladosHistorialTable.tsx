import type { Traslado } from '../types/traslado.types'
import { TrasladoEstadoBadge } from './TrasladoEstadoBadge'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

interface TrasladosHistorialTableProps {
  historial: readonly Traslado[]
  isLoading: boolean
}

export function TrasladosHistorialTable({ historial, isLoading }: TrasladosHistorialTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando historial.</p>
  if (!historial.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Sin traspasos resueltos todavía.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
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
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {historial.map((traslado) => (
              <tr key={traslado.id} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3 font-bold capitalize text-slate-700">{FORMATO_FECHA.format(new Date(`${traslado.fecha}T00:00:00`))}</td>
                <td className="px-5 py-3 font-black text-slate-900">{traslado.trabajadorNombre}</td>
                <td className="px-5 py-3 font-bold text-slate-700">
                  {traslado.fincaOrigenNombre} → {traslado.fincaDestinoNombre}
                </td>
                <td className="px-5 py-3">
                  <TrasladoEstadoBadge estado={traslado.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
