import type { TendenciaPunto } from '../types/kpis.types'

interface TendenciaLineChartProps {
  titulo: string
  puntos: readonly TendenciaPunto[]
  unidad: string
}

const ANCHO_GRAFICO = 320
const ALTO_GRAFICO = 96
const COLOR_LINEA = '#15803d'

function formatearFechaCorta(fecha: string): string {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`
}

export function TendenciaLineChart({ titulo, puntos, unidad }: TendenciaLineChartProps) {
  if (puntos.length === 0) {
    return (
      <div className="neu-raised flex min-h-0 flex-1 flex-col rounded-[2rem] p-4 sm:p-5">
        <h2 className="text-lg font-black tracking-tight text-slate-900">{titulo}</h2>
        <p className="mt-4 font-bold text-slate-500">Sin datos este mes.</p>
      </div>
    )
  }

  const valorMaximo = Math.max(...puntos.map((punto) => punto.valor), 1)
  const coordenadas = puntos.map((punto, index) => ({
    x: puntos.length > 1 ? (index / (puntos.length - 1)) * ANCHO_GRAFICO : ANCHO_GRAFICO / 2,
    y: ALTO_GRAFICO - (punto.valor / valorMaximo) * ALTO_GRAFICO,
  }))
  const rutaLinea = coordenadas.map((punto, index) => `${index === 0 ? 'M' : 'L'} ${punto.x} ${punto.y}`).join(' ')
  const rutaArea = `${rutaLinea} L ${ANCHO_GRAFICO} ${ALTO_GRAFICO} L 0 ${ALTO_GRAFICO} Z`
  const ultimoPunto = coordenadas[coordenadas.length - 1]
  const ultimoValor = puntos[puntos.length - 1].valor

  return (
    <div className="neu-raised flex min-h-0 flex-1 flex-col rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-black tracking-tight text-slate-900">{titulo}</h2>
        <span className="shrink-0 text-sm font-bold text-slate-600">
          {formatearFechaCorta(puntos[0].fecha)} — {formatearFechaCorta(puntos[puntos.length - 1].fecha)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${ANCHO_GRAFICO} ${ALTO_GRAFICO}`}
        className="mt-4 h-24 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Tendencia de ${titulo.toLowerCase()}`}
      >
        <path d={rutaArea} fill={COLOR_LINEA} opacity={0.1} />
        <path d={rutaLinea} fill="none" stroke={COLOR_LINEA} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={ultimoPunto.x} cy={ultimoPunto.y} r={4} fill={COLOR_LINEA} stroke="#e7ebf1" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mt-2 text-sm font-bold text-slate-600">
        Último día registrado: {ultimoValor.toLocaleString('es-CL')} {unidad}
      </p>
    </div>
  )
}
