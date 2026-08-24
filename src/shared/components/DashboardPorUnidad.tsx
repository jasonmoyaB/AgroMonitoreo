import { ProduccionDiariaChart } from './ProduccionDiariaChart'
import { RankingBarChart } from './RankingBarChart'
import type { DashboardUnidad } from '../types/kpis.types'

interface DashboardPorUnidadProps {
  bloques: readonly DashboardUnidad[]
  // Se intercala en cada titulo: "del mes" o "· Agosto 2026". La unidad la agrega este componente.
  sufijoTitulo: string
}

export function DashboardPorUnidad({ bloques, sufijoTitulo }: DashboardPorUnidadProps) {
  if (bloques.length === 0) {
    return <p className="font-bold text-slate-500">Sin producción registrada este mes.</p>
  }

  return (
    <>
      {bloques.map((bloque) => (
        <BloqueUnidad key={bloque.unidad} bloque={bloque} sufijoTitulo={sufijoTitulo} />
      ))}
    </>
  )
}

function BloqueUnidad({ bloque, sufijoTitulo }: { bloque: DashboardUnidad; sufijoTitulo: string }) {
  const sufijo = `${sufijoTitulo} · ${bloque.unidad}`

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
