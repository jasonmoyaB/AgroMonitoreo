import { Download } from 'lucide-react'
import { MESES } from '../../captura/constants/meses.constants'

interface DescargarAusenciasPdfActions {
  onAnioChange: (anio: number) => void
  onMesChange: (mes: number) => void
  onDescargar: () => void
}

interface DescargarAusenciasPdfControlsProps {
  anio: number
  mes: number
  aniosDisponibles: readonly number[]
  isDownloading: boolean
  actions: DescargarAusenciasPdfActions
}

export function DescargarAusenciasPdfControls(props: DescargarAusenciasPdfControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SelectorMes mes={props.mes} onChange={props.actions.onMesChange} />
      <SelectorAnio anio={props.anio} aniosDisponibles={props.aniosDisponibles} onChange={props.actions.onAnioChange} />
      <button
        type="button"
        onClick={props.actions.onDescargar}
        disabled={props.isDownloading}
        className="neu-pressed flex min-h-14 cursor-pointer items-center gap-2 rounded-2xl px-5 font-black text-green-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-wait disabled:opacity-60"
      >
        <Download className="h-5 w-5" aria-hidden="true" />
        {props.isDownloading ? 'Descargando...' : 'Descargar PDF'}
      </button>
    </div>
  )
}

function SelectorMes({ mes, onChange }: { mes: number; onChange: (mes: number) => void }) {
  return (
    <label className="neu-pressed flex min-h-14 items-center rounded-2xl px-3 font-black text-slate-700">
      <span className="sr-only">Mes del PDF</span>
      <select value={mes} onChange={(event) => onChange(Number(event.target.value))} className="cursor-pointer bg-transparent outline-none">
        {MESES.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.nombre}</option>)}
      </select>
    </label>
  )
}

function SelectorAnio({ anio, aniosDisponibles, onChange }: { anio: number; aniosDisponibles: readonly number[]; onChange: (anio: number) => void }) {
  return (
    <label className="neu-pressed flex min-h-14 items-center rounded-2xl px-3 font-black text-slate-700">
      <span className="sr-only">Anio del PDF</span>
      <select value={anio} onChange={(event) => onChange(Number(event.target.value))} className="cursor-pointer bg-transparent outline-none">
        {aniosDisponibles.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
      </select>
    </label>
  )
}
