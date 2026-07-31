import { Check, Download } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import type { FilaPlanilla } from '../../planilla/types/planilla.types'

const AVATAR_SIZE_PX = 40
const COLUMNAS = ['Trabajador', 'Salario mensual', 'Monto semanal', 'Ausencias', 'Monto quincena', 'Estado', ''] as const

interface PlanillaAcciones {
  onPagar: (fila: FilaPlanilla) => void
  onDescargarPdf: (fila: FilaPlanilla) => void
  onVerAusencias: (fila: FilaPlanilla) => void
}

interface PlanillaTableProps {
  filas: readonly FilaPlanilla[]
  isLoading: boolean
  actions: PlanillaAcciones
}

export function PlanillaTable({ filas, isLoading, actions }: PlanillaTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando planilla.</p>
  if (!filas.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Esta finca no tiene trabajadores registrados.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              {COLUMNAS.map((columna) => (
                <th key={columna} scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <PlanillaFila key={fila.trabajadorId} fila={fila} actions={actions} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PlanillaFilaProps {
  fila: FilaPlanilla
  actions: PlanillaAcciones
}

function PlanillaFila({ fila, actions }: PlanillaFilaProps) {
  // pagada: el monto y las ausencias que se muestran son el historico de pagos_quincenales,
  // no lo que saldria del salario y la asistencia de hoy
  const pagada = fila.pago !== null
  const monto = fila.pago?.monto ?? fila.montoNeto
  const moneda = fila.pago?.moneda ?? fila.moneda
  const diasAusentes = fila.pago?.diasAusentes ?? fila.ausencias.length
  const deduccion = (fila.pago?.montoBruto ?? fila.montoQuincena) - monto

  return (
    <tr className="border-b border-slate-900/5 last:border-b-0">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nombre={fila.nombreCompleto} fotoUrl={fila.fotoUrl} size={AVATAR_SIZE_PX} />
          <span className="truncate text-base font-black text-slate-900">{fila.nombreCompleto}</span>
        </div>
      </td>
      <td className="px-5 py-3 font-bold text-slate-600">{formatearMonto(fila.salarioMensual, fila.moneda)}</td>
      <td className="px-5 py-3 font-bold text-slate-600">{formatearMonto(fila.montoSemanal, fila.moneda)}</td>
      <td className="px-5 py-3">
        <CeldaAusencias fila={fila} resumen={{ diasAusentes, deduccion, moneda }} onVer={actions.onVerAusencias} />
      </td>
      <td className="px-5 py-3 text-base font-black text-slate-900">{formatearMonto(monto, moneda)}</td>
      <td className="px-5 py-3">
        {pagada ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-green-800">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Pagada
          </span>
        ) : (
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Pendiente</span>
        )}
      </td>
      <td className="px-5 py-3">
        {pagada ? (
          <button
            type="button"
            onClick={() => actions.onDescargarPdf(fila)}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 font-black text-green-900 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Liquidación
          </button>
        ) : (
          <button
            type="button"
            onClick={() => actions.onPagar(fila)}
            disabled={fila.salarioMensual <= 0}
            title={fila.salarioMensual <= 0 ? 'Primero asigna un salario mensual en la pantalla de Salarios' : undefined}
            className="neu-raised min-h-11 cursor-pointer rounded-xl px-4 font-black text-green-900 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pagar quincena
          </button>
        )}
      </td>
    </tr>
  )
}

interface CeldaAusenciasProps {
  fila: FilaPlanilla
  resumen: { diasAusentes: number; deduccion: number; moneda: FilaPlanilla['moneda'] }
  onVer: (fila: FilaPlanilla) => void
}

// solo es boton cuando hay fechas que mostrar: una fila pagada conserva el conteo del
// snapshot aunque despues borren las ausencias, y el modal quedaria vacio
function CeldaAusencias({ fila, resumen, onVer }: CeldaAusenciasProps) {
  const { diasAusentes, deduccion, moneda } = resumen
  if (diasAusentes === 0) return <span className="font-bold text-slate-400">—</span>

  const etiqueta = `${diasAusentes} ${diasAusentes === 1 ? 'día' : 'días'} · −${formatearMonto(deduccion, moneda)}`
  if (fila.ausencias.length === 0) return <span className="font-black text-amber-700">{etiqueta}</span>

  return (
    <button
      type="button"
      onClick={() => onVer(fila)}
      title="Ver qué días faltó"
      className="min-h-11 cursor-pointer rounded-xl px-2 font-black text-amber-700 underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
    >
      {etiqueta}
    </button>
  )
}
