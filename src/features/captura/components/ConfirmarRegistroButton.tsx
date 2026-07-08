import { CircleCheckBig } from 'lucide-react'

interface ConfirmarRegistroButtonProps {
  onClick: () => void
  disabled: boolean
}

export function ConfirmarRegistroButton({ onClick, disabled }: ConfirmarRegistroButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[88px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-6 text-2xl font-black text-white shadow-[8px_8px_16px_rgba(6,78,59,0.45),-8px_-8px_16px_rgba(255,255,255,0.5)] transition-all duration-150 hover:scale-[1.02] active:translate-y-0.5 active:scale-100 active:shadow-[inset_5px_5px_10px_rgba(6,78,59,0.5),inset_-5px_-5px_10px_rgba(255,255,255,0.25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
    >
      <CircleCheckBig className="h-8 w-8" aria-hidden="true" />
      Confirmar
    </button>
  )
}
