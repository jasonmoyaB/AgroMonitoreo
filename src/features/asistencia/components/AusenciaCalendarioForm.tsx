import type { FormEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DIAS_SEMANA, DIAS_SEMANA_CLAVES } from '../constants/calendario.constants'
import { obtenerEspaciosCalendario } from '../utils/obtener-espacios-calendario'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'
import { MESES } from '../../captura/constants/meses.constants'
import type { Trabajador, TipoAusencia } from '../../../shared/types/domain.types'
import { TipoAusenciaSelector } from './TipoAusenciaSelector'

interface AusenciaCalendarioFormProps {
  trabajador: Trabajador | null
  anio: number
  mes: number
  fechasSeleccionadas: readonly string[]
  tipo: TipoAusencia
  error: string | null
  isSubmitting: boolean
  onCambiarMes: (direccion: -1 | 1) => void
  onToggleFecha: (fecha: string) => void
  onSeleccionarTipo: (tipo: TipoAusencia) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  construirFecha: (dia: number) => string
}

export function AusenciaCalendarioForm(props: AusenciaCalendarioFormProps) {
  const dias = obtenerDiasEnMes(props.anio, props.mes)
  const espacios = obtenerEspaciosCalendario(props.anio, props.mes)
  const mesNombre = MESES.find((item) => item.valor === props.mes)?.nombre ?? 'Mes'

  return (
    <form onSubmit={props.onSubmit} className="space-y-5">
      <p className="font-bold leading-7 text-slate-600">Selecciona en el calendario los dias que {props.trabajador?.nombreCompleto ?? 'el trabajador'} estara ausente/no vino.</p>

      <div className="neu-pressed rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => props.onCambiarMes(-1)} aria-label="Mes anterior" className="neu-raised flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <strong className="text-center text-lg font-black capitalize text-slate-900">{mesNombre} {props.anio}</strong>
          <button type="button" onClick={() => props.onCambiarMes(1)} aria-label="Mes siguiente" className="neu-raised flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {DIAS_SEMANA.map((dia, index) => <span key={DIAS_SEMANA_CLAVES[index]} className="text-xs font-black text-slate-500">{dia}</span>)}
          {Array.from({ length: espacios }, (_item, index) => <span key={`vacio-${index}`} aria-hidden="true" />)}
          {Array.from({ length: dias }, (_item, index) => {
            const dia = index + 1
            const fecha = props.construirFecha(dia)
            const seleccionado = props.fechasSeleccionadas.includes(fecha)
            return <DiaCalendario key={fecha} dia={dia} seleccionado={seleccionado} onClick={() => props.onToggleFecha(fecha)} />
          })}
        </div>
      </div>

      <p className="text-sm font-black text-slate-600">Seleccionados: {props.fechasSeleccionadas.length}</p>

      <TipoAusenciaSelector tipo={props.tipo} onSeleccionar={props.onSeleccionarTipo} />

      {errorMessage(props.error)}
      <button type="submit" disabled={props.isSubmitting} className="min-h-14 w-full cursor-pointer rounded-2xl bg-green-700 px-5 font-black text-white shadow-lg shadow-green-900/20 disabled:cursor-wait disabled:opacity-60">
        {props.isSubmitting ? 'Guardando ausencia...' : 'Guardar dias seleccionados'}
      </button>
    </form>
  )
}

function DiaCalendario({ dia, seleccionado, onClick }: { dia: number; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionado}
      className={`min-h-11 cursor-pointer rounded-2xl text-sm font-black transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 ${seleccionado ? 'bg-rose-700 text-white shadow-lg shadow-rose-900/20' : 'bg-white/60 text-slate-800 hover:bg-white'}`}
    >
      {dia}
    </button>
  )
}

function errorMessage(error: string | null) {
  if (!error) return null
  return <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-800">{error}</p>
}
