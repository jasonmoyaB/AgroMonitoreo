import { Minus, Plus } from 'lucide-react'
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

export function NumericStepper({ value, step, label, onChange, rango = RANGO_POR_DEFECTO }: NumericStepperProps) {
  const decrementar = () => onChange(Math.max(rango.min, redondear(value - step)))
  const incrementar = () => onChange(Math.min(rango.max, redondear(value + step)))

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-lg font-semibold capitalize text-slate-600">{label}</span>
      <div className="flex items-center gap-6">
        <StepperButton icon={<Minus size={32} />} onClick={decrementar} disabled={value <= rango.min} />
        <span className="neu-well flex w-28 items-center justify-center rounded-2xl py-3 text-5xl font-black tabular-nums text-slate-800">
          {value}
        </span>
        <StepperButton icon={<Plus size={32} />} onClick={incrementar} disabled={value >= rango.max} />
      </div>
    </div>
  )
}
