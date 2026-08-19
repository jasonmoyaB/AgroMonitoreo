import { LaborIcon } from './LaborIcon'
import type { HorasPorLabor } from '../types/kpis.types'

interface HorasPorLaborChartProps {
  titulo: string
  items: readonly HorasPorLabor[]
}

const OPACIDAD_FONDO_ICONO = '1f'
const ANCHO_MINIMO_SEGMENTO = 2

function formatear(valor: number): string {
  return valor.toLocaleString('es-CL', { maximumFractionDigits: 1 })
}

export function HorasPorLaborChart({ titulo, items }: HorasPorLaborChartProps) {
  const totalHoras = items.reduce((suma, item) => suma + item.horas, 0)

  return (
    <div className="neu-raised flex min-h-0 flex-col rounded-[2rem] p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-black tracking-tight text-slate-900">{titulo}</h2>
        <span className="text-sm font-bold text-slate-600">{formatear(totalHoras)} h en total</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 font-bold text-slate-500">Sin horas registradas este mes.</p>
      ) : (
        <>
          <div className="neu-well mt-4 flex h-4 w-full overflow-hidden rounded-full">
            {items.map((item) => (
              <span
                key={item.id}
                className="h-full"
                style={{ width: `${Math.max(item.porcentaje, ANCHO_MINIMO_SEGMENTO)}%`, backgroundColor: item.color }}
                title={`${item.nombre}: ${formatear(item.porcentaje)}%`}
              />
            ))}
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <FilaLabor key={item.id} item={item} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function FilaLabor({ item }: { item: HorasPorLabor }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${item.color}${OPACIDAD_FONDO_ICONO}` }}>
        <LaborIcon name={item.icono} className="h-5 w-5" style={{ color: item.color }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-bold text-slate-700">{item.nombre}</span>
          <span className="shrink-0 text-sm font-black text-slate-900">{formatear(item.horas)} h</span>
        </span>
        <span className="flex items-baseline justify-between gap-2 text-xs font-bold text-slate-500">
          <span className="truncate">
            {formatear(item.rendimiento)} {item.unidad}/hora
          </span>
          <span className="shrink-0">{formatear(item.porcentaje)}%</span>
        </span>
      </span>
    </li>
  )
}
