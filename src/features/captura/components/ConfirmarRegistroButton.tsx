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
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-6 text-2xl font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
    >
      <CircleCheckBig className="h-8 w-8" aria-hidden="true" />
      Confirmar
    </button>
  )
}
