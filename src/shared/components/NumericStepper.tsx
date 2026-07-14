import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { StepperButton } from './StepperButton'

interface RangoNumerico {
  min: number
  max: number
}

interface NumericStepperProps {
  value: number
  step: number
  label: string
  onChange: (value: number) => void
  rango?: RangoNumerico
}

const RANGO_POR_DEFECTO: RangoNumerico = { min: 0, max: Number.POSITIVE_INFINITY }

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

function limitarARango(valor: number, rango: RangoNumerico): number {
  return Math.min(rango.max, Math.max(rango.min, valor))
}

interface EstadoTexto {
  texto: string
  valorPrevio: number
}

export function NumericStepper({ value, step, label, onChange, rango = RANGO_POR_DEFECTO }: NumericStepperProps) {
  const [estado, setEstado] = useState<EstadoTexto>({ texto: String(value), valorPrevio: value })
  const { texto } = estado

  if (value !== estado.valorPrevio) {
    setEstado({ texto: String(value), valorPrevio: value })
  }

  const decrementar = () => onChange(limitarARango(redondear(value - step), rango))
  const incrementar = () => onChange(limitarARango(redondear(value + step), rango))
  const longitudMaxima = Number.isFinite(rango.max) ? String(Math.trunc(rango.max)).length : undefined

  function manejarEscritura(evento: ChangeEvent<HTMLInputElement>) {
    const textoEscrito =
      longitudMaxima === undefined ? evento.target.value : evento.target.value.slice(0, longitudMaxima)
    setEstado((actual) => ({ ...actual, texto: textoEscrito }))
    const valorEscrito = Number(textoEscrito)
    if (textoEscrito === '' || Number.isNaN(valorEscrito)) return
    onChange(valorEscrito)
  }

  function manejarSalida() {
    const valorEscrito = Number(texto)
    const valorValido = texto === '' || Number.isNaN(valorEscrito) ? rango.min : limitarARango(redondear(valorEscrito), rango)
    onChange(valorValido)
    setEstado((actual) => ({ ...actual, texto: String(valorValido) }))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-lg font-semibold capitalize text-slate-600">{label}</span>
      <div className="flex items-center gap-6">
        <StepperButton icon={<Minus size={32} />} onClick={decrementar} disabled={value <= rango.min} />
        <input
          type="number"
          inputMode="decimal"
          value={texto}
          min={rango.min}
          max={rango.max === Number.POSITIVE_INFINITY ? undefined : rango.max}
          onChange={manejarEscritura}
          onFocus={(evento) => evento.target.select()}
          onBlur={manejarSalida}
          aria-label={label}
          className="neu-well w-28 rounded-2xl py-3 text-center text-5xl font-black tabular-nums text-slate-800 [appearance:textfield] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <StepperButton icon={<Plus size={32} />} onClick={incrementar} disabled={value >= rango.max} />
      </div>
    </div>
  )
}
