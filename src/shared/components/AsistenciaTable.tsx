import type { AsistenciaConTrabajador } from '../../features/asistencia/types/asistencia.types'
import { formatearTipoAusencia } from '../../features/asistencia/utils/formatear-tipo-ausencia'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

interface AsistenciaTableProps {
  registros: readonly AsistenciaConTrabajador[]
  isLoading: boolean
}

export function AsistenciaTable({ registros, isLoading }: AsistenciaTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando asistencia.</p>
  if (!registros.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Sin ausencias registradas esta semana.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Día
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Trabajador
              </th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro) => (
              <tr key={registro.id} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3 font-bold capitalize text-slate-700">{formatearFecha(registro.fecha)}</td>
                <td className="px-5 py-3 font-black text-slate-900">{registro.trabajadorNombre}</td>
                <td className="px-5 py-3 font-bold text-slate-700">{formatearTipoAusencia(registro.tipo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatearFecha(fecha: string): string {
  return FORMATO_FECHA.format(new Date(`${fecha}T00:00:00`))
}
