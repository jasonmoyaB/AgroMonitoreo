import type { MetricaPorLabor } from '../types/trabajador-metricas.types'

interface TrabajadorMetricasTablaProps {
  metricas: readonly MetricaPorLabor[]
}

export function TrabajadorMetricasTabla({ metricas }: TrabajadorMetricasTablaProps) {
  if (!metricas.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Sin registros en el período seleccionado.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Labor
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Horas
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Cantidad
              </th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                Productividad
              </th>
            </tr>
          </thead>
          <tbody>
            {metricas.map((metrica) => (
              <TrabajadorMetricasTablaFila key={metrica.tipoLaborId} metrica={metrica} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TrabajadorMetricasTablaFila({ metrica }: { metrica: MetricaPorLabor }) {
  return (
    <tr className="border-b border-slate-900/5 last:border-b-0 hover:bg-white/45">
      <td className="px-5 py-3 text-lg font-black text-slate-900">{metrica.nombre}</td>
      <td className="px-5 py-3 text-right text-lg font-bold text-slate-700">{metrica.horas.toLocaleString('es-CL')}</td>
      <td className="px-5 py-3 text-right text-lg font-bold text-slate-700">
        {metrica.cantidad.toLocaleString('es-CL')} {metrica.unidadMedida ?? ''}
      </td>
      <td className="px-5 py-3 text-right text-lg font-black text-green-800">{metrica.productividad.toFixed(1)}</td>
    </tr>
  )
}
