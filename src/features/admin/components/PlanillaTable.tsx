import { Check, Download } from 'lucide-react'
import { Avatar } from '../../../shared/components/Avatar'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import { CeldaAusencias } from './CeldaAusencias'
import { CeldasSalario } from './CeldasSalario'
import type { EdicionSalario, FilaPlanilla } from '../../planilla/types/planilla.types'

const AVATAR_SIZE_PX = 40
const COLUMNAS = ['Trabajador', 'Salario mensual', 'Moneda', 'Ausencias', 'Monto semanal', 'Monto quincena', 'Estado', ''] as const
const BOTON_ACCION_CLASS =
  'min-h-11 cursor-pointer rounded-xl font-black text-green-900 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900'

interface PlanillaAcciones {
  onPagar: (fila: FilaPlanilla) => void
  onDescargarPdf: (fila: FilaPlanilla) => void
  onVerAusencias: (fila: FilaPlanilla) => void
  onGuardarSalario: (input: EdicionSalario) => void
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
        <table className="w-full min-w-[64rem] border-collapse text-left">
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
      <CeldasSalario fila={fila} onGuardar={actions.onGuardarSalario} />
      <td className="px-5 py-3">
        <CeldaAusencias fila={fila} resumen={{ diasAusentes, deduccion, moneda }} onVer={actions.onVerAusencias} />
      </td>
      <td className="px-5 py-3 font-bold text-slate-600">{formatearMonto(fila.montoSemanal, fila.moneda)}</td>
      <td className="px-5 py-3 text-base font-black text-slate-900">{formatearMonto(monto, moneda)}</td>
      <td className="px-5 py-3">
        <CeldaEstado pagada={pagada} />
      </td>
      <td className="px-5 py-3">
        <CeldaAcciones fila={fila} pagada={pagada} actions={actions} />
      </td>
    </tr>
  )
}

interface CeldaEstadoProps {
  pagada: boolean
}

function CeldaEstado({ pagada }: CeldaEstadoProps) {
  if (!pagada) return <span className="text-xs font-black uppercase tracking-wider text-slate-500">Pendiente</span>

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-green-800">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Pagada
    </span>
  )
}

interface CeldaAccionesProps {
  fila: FilaPlanilla
  pagada: boolean
  actions: Pick<PlanillaAcciones, 'onPagar' | 'onDescargarPdf'>
}

function CeldaAcciones({ fila, pagada, actions }: CeldaAccionesProps) {
  if (pagada) {
    return (
      <button type="button" onClick={() => actions.onDescargarPdf(fila)} className={`${BOTON_ACCION_CLASS} flex items-center gap-2 px-3`}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Liquidación
      </button>
    )
  }

  const sinSalario = fila.salarioMensual <= 0
  return (
    <button
      type="button"
      onClick={() => actions.onPagar(fila)}
      disabled={sinSalario}
      title={sinSalario ? 'Primero escribe el salario mensual en esta misma fila' : undefined}
      className={`${BOTON_ACCION_CLASS} neu-raised px-4 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      Pagar quincena
    </button>
  )
}
