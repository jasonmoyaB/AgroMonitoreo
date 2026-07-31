import { leerNumeroNoNegativo } from '../../../shared/utils/leer-numero-no-negativo'
import type { Finca, Moneda } from '../../../shared/types/domain.types'
import type { ActualizarValorHoraInput } from '../types/finca-form.types'

const ETIQUETA_POR_MONEDA: Record<Moneda, string> = { colones: 'Valor por hora (colones)', usd: 'Valor por hora (USD)' }

interface ValorHoraInputProps {
  finca: Finca
  moneda: Moneda
  onGuardar: (input: ActualizarValorHoraInput) => void
}

// el dia de ausencia se descuenta con este valor por 8 horas, en la moneda del salario
// del trabajador. cada input manda solo el suyo: nunca los dos juntos.
export function ValorHoraInput({ finca, moneda, onGuardar }: ValorHoraInputProps) {
  const valorActual = moneda === 'usd' ? finca.valorHoraUsd : finca.valorHora
  const inputId = `valor-hora-${moneda}`

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={inputId} className="font-black text-slate-700">
        {ETIQUETA_POR_MONEDA[moneda]}
      </label>
      <input
        id={inputId}
        type="number"
        min={0}
        step="0.01"
        defaultValue={valorActual}
        key={`${finca.id}-${moneda}`}
        onBlur={(event) => {
          const valorHora = leerNumeroNoNegativo(event.target.value)
          if (valorHora === null) {
            event.target.value = String(valorActual)
            return
          }
          onGuardar({ id: finca.id, valorHora, moneda })
        }}
        className="neu-pressed min-h-11 w-32 rounded-xl px-3 font-bold text-slate-900"
      />
    </div>
  )
}
