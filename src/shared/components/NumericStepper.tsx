import { Minus, Plus } from 'lucide-react'
import { StepperButton } from './StepperButton'

interface NumericStepperProps {
  value: number
  step: number
  label: string
  onChange: (value: number) => void
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function NumericStepper({ value, step, label, onChange }: NumericStepperProps) {
  const decrementar = () => onChange(Math.max(0, redondear(value - step)))
  const incrementar = () => onChange(redondear(value + step))

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-lg font-semibold capitalize text-slate-600">{label}</span>
      <div className="flex items-center gap-6">
        <StepperButton icon={<Minus size={32} />} onClick={decrementar} disabled={value <= 0} />
        <span className="neu-well flex w-28 items-center justify-center rounded-2xl py-3 text-5xl font-black tabular-nums text-slate-800">
          {value}
        </span>
        <StepperButton icon={<Plus size={32} />} onClick={incrementar} />
      </div>
    </div>
  )
}
