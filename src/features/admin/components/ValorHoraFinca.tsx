import { ValorHoraInput } from './ValorHoraInput'
import { useActualizarValorHora } from '../hooks/use-actualizar-valor-hora'
import type { Finca } from '../../../shared/types/domain.types'

interface ValorHoraFincaProps {
  finca: Finca
}

export function ValorHoraFinca({ finca }: ValorHoraFincaProps) {
  const actualizarValorHora = useActualizarValorHora()

  return (
    <div className="neu-raised mb-4 rounded-3xl p-5">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Valor hora de {finca.nombre}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ValorHoraInput finca={finca} moneda="colones" onGuardar={actualizarValorHora.mutate} />
        <ValorHoraInput finca={finca} moneda="usd" onGuardar={actualizarValorHora.mutate} />
      </div>
      <p className="mt-3 font-bold leading-6 text-slate-600">Con esto se descuenta cada día de ausencia: valor hora × 8 horas.</p>
    </div>
  )
}
