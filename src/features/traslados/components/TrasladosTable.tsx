import type { Traslado } from '../types/traslado.types'
import { TrasladoEstadoBadge } from './TrasladoEstadoBadge'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

const CLASE_TH = 'px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600'
// en mobile cada fila se apila (block) y no hace falta scroll horizontal; desde sm vuelve a ser tabla
const CLASE_FILA = 'block border-b border-slate-900/5 px-5 py-4 last:border-b-0 sm:table-row sm:px-0 sm:py-0'
const CLASE_CELDA = 'block sm:table-cell sm:px-5 sm:py-3'

interface TrasladosTableProps {
  traslados: readonly Traslado[]
  isLoading: boolean
  /** si viene, la tercera columna muestra el sentido (recibido/prestado) en vez de origen → destino */
  fincaPropiaId?: string
}

export function TrasladosTable({ traslados, isLoading, fincaPropiaId = '' }: TrasladosTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando traspasos.</p>
  if (!traslados.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Sin traspasos que mostrar.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <table className="w-full border-collapse text-left">
        <thead className="hidden sm:table-header-group">
          <tr className="border-b border-slate-900/10">
            <th scope="col" className={CLASE_TH}>
              Día
            </th>
            <th scope="col" className={CLASE_TH}>
              Trabajador
            </th>
            <th scope="col" className={CLASE_TH}>
              {fincaPropiaId === '' ? 'De → A' : 'Sentido'}
            </th>
            <th scope="col" className={CLASE_TH}>
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {traslados.map((traslado) => (
            <tr key={traslado.id} className={CLASE_FILA}>
              <td className={`${CLASE_CELDA} font-bold capitalize text-slate-700`}>{FORMATO_FECHA.format(new Date(`${traslado.fecha}T00:00:00`))}</td>
              <td className={`${CLASE_CELDA} font-black text-slate-900`}>{traslado.trabajadorNombre}</td>
              <td className={`${CLASE_CELDA} font-bold text-slate-700`}>{describirRuta(traslado, fincaPropiaId)}</td>
              <td className={`${CLASE_CELDA} pt-2 sm:pt-3`}>
                <TrasladoEstadoBadge estado={traslado.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function describirRuta(traslado: Traslado, fincaPropiaId: string): string {
  if (fincaPropiaId === '') return `${traslado.fincaOrigenNombre} → ${traslado.fincaDestinoNombre}`
  return traslado.fincaDestinoId === fincaPropiaId ? `Recibido de ${traslado.fincaOrigenNombre}` : `Prestado a ${traslado.fincaDestinoNombre}`
}
