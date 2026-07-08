import type { RankingItem } from '../types/dashboard.types'

interface RankingBarChartProps {
  titulo: string
  items: readonly RankingItem[]
  unidad: string
}

const COLOR_DESTACADO = '#15803d'
const COLOR_RESTO = '#cbd5e1'
const ANCHO_MINIMO_PORCENTAJE = 4

export function RankingBarChart({ titulo, items, unidad }: RankingBarChartProps) {
  const valorMaximo = items[0]?.valor ?? 0

  return (
    <div className="neu-raised flex min-h-0 flex-1 flex-col rounded-[2rem] p-4 sm:p-5">
      <h2 className="text-lg font-black tracking-tight text-slate-900">{titulo}</h2>
      {items.length === 0 ? (
        <p className="mt-4 font-bold text-slate-500">Sin datos este mes.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <RankingBarRow key={item.id} item={item} valorMaximo={valorMaximo} unidad={unidad} esDestacado={index === 0} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface RankingBarRowProps {
  item: RankingItem
  valorMaximo: number
  unidad: string
  esDestacado: boolean
}

function RankingBarRow({ item, valorMaximo, unidad, esDestacado }: RankingBarRowProps) {
  const anchoPorcentaje = valorMaximo > 0 ? Math.max((item.valor / valorMaximo) * 100, ANCHO_MINIMO_PORCENTAJE) : 0

  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-bold text-slate-700">{item.etiqueta}</span>
        <span className="shrink-0 text-sm font-black text-slate-900">
          {item.valor.toLocaleString('es-CL')} {unidad}
        </span>
      </div>
      <div className="neu-well mt-1 h-3 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full"
          style={{ width: `${anchoPorcentaje}%`, backgroundColor: esDestacado ? COLOR_DESTACADO : COLOR_RESTO }}
        />
      </div>
    </li>
  )
}
