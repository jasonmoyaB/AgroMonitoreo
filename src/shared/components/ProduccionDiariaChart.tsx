import { formatearFechaIsoDdMm, formatearFechaIsoDdMmAaaa } from '../utils/fecha-iso'
import { formatearCantidad } from '../utils/formatear-cantidad'
import type { DiaProduccion, ProduccionDiaria } from '../types/kpis.types'

interface ProduccionDiariaChartProps {
  titulo: string
  produccion: ProduccionDiaria
  unidad: string
}

const COLOR_MEJOR = '#15803d'
const COLOR_DIA = '#4ade80'
const COLOR_SIN_REGISTRO = '#cbd5e1'
const ALTO_MINIMO_BARRA_PORCENTAJE = 6
const ALTO_SIN_REGISTRO_PX = 3
const CADA_CUANTOS_DIAS_SE_ROTULA = 7

export function ProduccionDiariaChart({ titulo, produccion, unidad }: ProduccionDiariaChartProps) {
  const { dias, maximo, promedio, diasConRegistro, mejorDia } = produccion
  const diasSinRegistro = dias.length - diasConRegistro

  return (
    <div className="neu-raised shrink-0 rounded-[2rem] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-black tracking-tight text-slate-900">{titulo}</h2>
        <span className="text-sm font-bold text-slate-600">
          {diasConRegistro} de {dias.length} días con registro
        </span>
      </div>

      {diasConRegistro === 0 ? (
        <p className="mt-4 font-bold text-slate-500">Sin producción registrada este mes.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Resumen etiqueta="Promedio por día trabajado" valor={`${formatearCantidad(promedio)} ${unidad}`} />
            <Resumen etiqueta="Mejor día" valor={mejorDia === null ? '—' : `${formatearCantidad(mejorDia.valor)} ${unidad} · ${formatearFechaIsoDdMm(mejorDia.fecha)}`} />
            <Resumen etiqueta="Días sin cargar" valor={String(diasSinRegistro)} />
          </div>

          <div className="neu-well mt-4 rounded-2xl p-3">
            <div className="relative h-28 sm:h-36">
              <div
                className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-amber-500/80"
                style={{ bottom: `${(promedio / maximo) * 100}%` }}
                aria-hidden="true"
              />
              <div
                className="flex h-full items-end gap-px"
                role="img"
                aria-label={`Producción por día: ${diasConRegistro} de ${dias.length} días con registro, promedio ${formatearCantidad(promedio)} ${unidad}`}
              >
                {dias.map((dia) => (
                  <BarraDia key={dia.fecha} dia={dia} maximo={maximo} unidad={unidad} esMejor={dia.fecha === mejorDia?.fecha} />
                ))}
              </div>
            </div>
            <div className="mt-1 flex gap-px">
              {dias.map((dia) => (
                <span key={dia.fecha} className="flex-1 text-center text-[0.6rem] font-bold leading-none text-slate-400">
                  {(dia.dia - 1) % CADA_CUANTOS_DIAS_SE_ROTULA === 0 ? dia.dia : ''}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-600">
            La línea punteada es el promedio ({formatearCantidad(promedio)} {unidad}). Las barras grises son días sin ningún registro.
          </p>
        </>
      )}
    </div>
  )
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <p className="truncate text-lg font-black tracking-tight text-slate-900">{valor}</p>
    </div>
  )
}

interface BarraDiaProps {
  dia: DiaProduccion
  maximo: number
  unidad: string
  esMejor: boolean
}

function BarraDia({ dia, maximo, unidad, esMejor }: BarraDiaProps) {
  const sinRegistro = dia.valor <= 0
  const altoPorcentaje = Math.max((dia.valor / maximo) * 100, ALTO_MINIMO_BARRA_PORCENTAJE)

  return (
    <div
      className="flex h-full flex-1 items-end"
      title={sinRegistro ? `${formatearFechaIsoDdMmAaaa(dia.fecha)}: sin registro` : `${formatearFechaIsoDdMmAaaa(dia.fecha)}: ${formatearCantidad(dia.valor)} ${unidad}`}
    >
      <div
        className="w-full rounded-t-[3px]"
        style={{
          height: sinRegistro ? `${ALTO_SIN_REGISTRO_PX}px` : `${altoPorcentaje}%`,
          backgroundColor: sinRegistro ? COLOR_SIN_REGISTRO : esMejor ? COLOR_MEJOR : COLOR_DIA,
        }}
      />
    </div>
  )
}
