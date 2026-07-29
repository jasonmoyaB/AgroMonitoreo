import { MESES } from '../../captura/constants/meses.constants'

interface PeriodoSelectorProps {
  anio: number
  mes: number
  aniosDisponibles: readonly number[]
  onAnioChange: (anio: number) => void
  onMesChange: (mes: number) => void
}

const CLASES_SELECT = 'neu-pressed flex min-h-14 items-center rounded-2xl px-3 font-black text-slate-700'

export function PeriodoSelector({ anio, mes, aniosDisponibles, onAnioChange, onMesChange }: PeriodoSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={CLASES_SELECT}>
        <span className="sr-only">Mes</span>
        <select value={mes} onChange={(event) => onMesChange(Number(event.target.value))} className="cursor-pointer bg-transparent outline-none">
          {MESES.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.nombre}</option>)}
        </select>
      </label>

      <label className={CLASES_SELECT}>
        <span className="sr-only">Anio</span>
        <select value={anio} onChange={(event) => onAnioChange(Number(event.target.value))} className="cursor-pointer bg-transparent outline-none">
          {aniosDisponibles.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
      </label>
    </div>
  )
}
