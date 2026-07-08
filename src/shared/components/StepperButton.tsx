import type { ReactNode } from 'react'

interface StepperButtonProps {
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
}

export function StepperButton({ icon, onClick, disabled }: StepperButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-white transition-transform active:scale-90 disabled:opacity-30"
    >
      {icon}
    </button>
  )
}
