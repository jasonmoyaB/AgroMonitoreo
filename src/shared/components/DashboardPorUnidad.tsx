import { ProduccionDiariaChart } from './ProduccionDiariaChart'
import { RankingBarChart } from './RankingBarChart'
import type { DashboardUnidad } from '../types/kpis.types'

interface DashboardPorUnidadProps {
  bloques: readonly DashboardUnidad[]
  // Ya formateado ("Agosto 2026"). Los titulos los arma entero este componente: si el
  // separador se reparte con el llamador, cada pantalla inventa el suyo.
  periodoNombre: string
}

export function DashboardPorUnidad({ bloques, periodoNombre }: DashboardPorUnidadProps) {
  if (bloques.length === 0) {
    return <p className="font-bold text-slate-500">Sin producción registrada este mes.</p>
  }

  return (
    <>
      {bloques.map((bloque) => (
        <BloqueUnidad key={bloque.unidad} bloque={bloque} periodoNombre={periodoNombre} />
      ))}
    </>
  )
}

interface BloqueUnidadProps {
  bloque: DashboardUnidad
  periodoNombre: string
}

function BloqueUnidad({ bloque, periodoNombre }: BloqueUnidadProps) {
  const sufijo = `· ${periodoNombre} · ${bloque.unidad}`

  return (
    <>
      <ProduccionDiariaChart titulo={`Producción diaria ${sufijo}`} produccion={bloque.produccionDiaria} unidad={bloque.unidad} />
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <RankingBarChart titulo={`Mejor labor ${sufijo}`} items={bloque.rankingLabores} unidad={bloque.unidad} />
        <RankingBarChart titulo={`Mejor trabajador ${sufijo}`} items={bloque.rankingTrabajadores} unidad={bloque.unidad} />
      </div>
    </>
  )
}
