import { BOTON_ACTIVAR, BOTON_DESACTIVAR, BOTON_TABLA } from '../../../shared/constants/botones-tabla.constants'
import type { Traslado } from '../types/traslado.types'

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

const CLASE_TH = 'px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600'
// en mobile cada fila se apila (block) y no hace falta scroll horizontal; desde sm vuelve a ser tabla
const CLASE_FILA = 'block border-b border-slate-900/5 px-5 py-4 last:border-b-0 sm:table-row sm:px-0 sm:py-0'
const CLASE_CELDA = 'block sm:table-cell sm:px-5 sm:py-3'
// en mobile los dos botones se reparten el ancho; desde sm vuelven a medir su contenido
const CLASE_BOTON = `${BOTON_TABLA} flex-1 sm:flex-none`

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
              De → A
            </th>
            <th scope="col" className={`${CLASE_TH} text-right`}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {pendientes.map((traslado) => {
            const resolviendo = resolviendoId === traslado.id
            return (
              <tr key={traslado.id} className={CLASE_FILA}>
                <td className={`${CLASE_CELDA} font-bold capitalize text-slate-700`}>{FORMATO_FECHA.format(new Date(`${traslado.fecha}T00:00:00`))}</td>
                <td className={`${CLASE_CELDA} font-black text-slate-900`}>{traslado.trabajadorNombre}</td>
                <td className={`${CLASE_CELDA} font-bold text-slate-700`}>
                  {traslado.fincaOrigenNombre} → {traslado.fincaDestinoNombre}
                </td>
                <td className={CLASE_CELDA}>
                  <div className="mt-3 flex gap-2 sm:mt-0 sm:justify-end">
                    <button type="button" disabled={resolviendo} onClick={() => onAprobar(traslado.id)} className={`${CLASE_BOTON} ${BOTON_ACTIVAR}`}>
                      Aprobar
                    </button>
                    <button type="button" disabled={resolviendo} onClick={() => onRechazar(traslado.id)} className={`${CLASE_BOTON} ${BOTON_DESACTIVAR}`}>
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
  )
}
