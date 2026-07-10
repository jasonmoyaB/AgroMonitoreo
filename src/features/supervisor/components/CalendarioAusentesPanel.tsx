import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DIAS_SEMANA, DIAS_SEMANA_CLAVES } from '../../asistencia/constants/calendario.constants'
import type { AsistenciaConTrabajador } from '../../asistencia/types/asistencia.types'
import { obtenerEspaciosCalendario } from '../../asistencia/utils/obtener-espacios-calendario'
import { construirFechaIso } from '../../captura/utils/fecha-iso'
import { MESES } from '../../captura/constants/meses.constants'
import { obtenerDiasEnMes } from '../../captura/utils/obtener-dias-en-mes'

interface CalendarioAusentesPanelProps {
  anio: number
  mes: number
  registros: readonly AsistenciaConTrabajador[]
  isLoading: boolean
  onCambiarMes: (direccion: -1 | 1) => void
}

export function CalendarioAusentesPanel({ anio, mes, registros, isLoading, onCambiarMes }: CalendarioAusentesPanelProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const dias = obtenerDiasEnMes(anio, mes)
  const espacios = obtenerEspaciosCalendario(anio, mes)
  const registrosPorFecha = agruparPorFecha(registros)
  const mesNombre = MESES.find((item) => item.valor === mes)?.nombre ?? 'Mes'
  const registrosSeleccionados = fechaSeleccionada ? registrosPorFecha.get(fechaSeleccionada) ?? [] : []

  return (
    <div className="mt-2 mb-2 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => onCambiarMes(-1)} aria-label="Mes anterior" className="neu-raised flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="text-center">
          <strong className="text-xl font-black capitalize text-slate-900">{mesNombre} {anio}</strong>
          <p className="text-sm font-bold text-slate-600">Trabajadores ausentes por dia</p>
        </div>
        <button type="button" onClick={() => onCambiarMes(1)} aria-label="Mes siguiente" className="neu-raised flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-2xl">
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="neu-pressed rounded-3xl p-3 sm:p-4">
          <div className="grid grid-cols-7 gap-2">
            {DIAS_SEMANA.map((dia, index) => <span key={DIAS_SEMANA_CLAVES[index]} className="text-center text-xs font-black text-slate-500">{dia}</span>)}
            {Array.from({ length: espacios }, (_item, index) => <span key={`vacio-${index}`} aria-hidden="true" />)}
            {Array.from({ length: dias }, (_item, index) => {
              const dia = index + 1
              const fecha = construirFechaIso({ anio, mes, dia })
              return <DiaAusentes key={fecha} dia={dia} fecha={fecha} registros={registrosPorFecha.get(fecha) ?? []} seleccionado={fecha === fechaSeleccionada} onSeleccionar={setFechaSeleccionada} />
            })}
          </div>
        </div>

        <DetalleDia fecha={fechaSeleccionada} registros={registrosSeleccionados} />
      </div>

      {isLoading && <p className="text-sm font-black text-slate-600">Cargando ausentes...</p>}
    </div>
  )
}

function DiaAusentes(props: { dia: number; fecha: string; registros: readonly AsistenciaConTrabajador[]; seleccionado: boolean; onSeleccionar: (fecha: string) => void }) {
  const tieneAusentes = props.registros.length > 0
  const selectedClass = props.seleccionado ? 'outline outline-3 outline-green-800' : ''

  return (
    <button
      type="button"
      disabled={!tieneAusentes}
      onClick={() => props.onSeleccionar(props.fecha)}
      className={`min-h-16 rounded-2xl bg-white/70 p-2 text-left shadow-inner shadow-white/60 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 sm:min-h-36 ${tieneAusentes ? 'cursor-pointer hover:bg-white' : 'cursor-default'} ${selectedClass}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-black text-slate-900">{props.dia}</span>
        {tieneAusentes && <span className="rounded-full bg-rose-100 px-2 py-1 text-[0.65rem] font-black text-rose-800">{props.registros.length}</span>}
      </div>
      {!tieneAusentes ? (
        <p className="hidden text-xs font-bold text-slate-400 sm:block">Sin ausentes</p>
      ) : (
        <div className="hidden sm:block">
          <ListaAusentes registros={props.registros} />
        </div>
      )}
    </button>
  )
}

function ListaAusentes({ registros }: { registros: readonly AsistenciaConTrabajador[] }) {
  return (
    <ul className="space-y-1">
      {registros.slice(0, 3).map((registro) => <li key={registro.id} className="truncate rounded-xl bg-rose-50 px-2 py-1 text-xs font-black text-rose-900">{registro.trabajadorNombre}</li>)}
      {registros.length > 3 && <li className="px-2 text-xs font-black text-slate-500">Click para ver {registros.length}</li>}
    </ul>
  )
}

function DetalleDia({ fecha, registros }: { fecha: string | null; registros: readonly AsistenciaConTrabajador[] }) {
  if (!fecha) {
    return <aside className="neu-pressed rounded-3xl p-5"><p className="font-black text-slate-900">Selecciona un dia con ausentes</p><p className="mt-2 text-sm font-bold text-slate-600">Veras la lista completa de trabajadores ausentes.</p></aside>
  }

  return (
    <aside className="neu-pressed rounded-3xl p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-green-800">{formatearFecha(fecha)}</p>
      <h3 className="mt-2 text-xl font-black text-slate-900">{registros.length} ausentes</h3>
      <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {registros.map((registro) => <li key={registro.id} className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-black text-slate-900 shadow-inner shadow-white/70">{registro.trabajadorNombre}</li>)}
      </ul>
    </aside>
  )
}

function agruparPorFecha(registros: readonly AsistenciaConTrabajador[]): Map<string, AsistenciaConTrabajador[]> {
  const grupos = new Map<string, AsistenciaConTrabajador[]>()
  registros.forEach((registro) => grupos.set(registro.fecha, [...(grupos.get(registro.fecha) ?? []), registro]))
  return grupos
}

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
