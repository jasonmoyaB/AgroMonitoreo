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
      className="neu-raised flex h-24 w-24 cursor-pointer items-center justify-center rounded-full text-slate-700 transition-all duration-150 hover:scale-105 active:neu-pressed active:scale-95 disabled:cursor-not-allowed disabled:neu-well disabled:text-slate-300 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
    >
      {icon}
    </button>
  )
}
