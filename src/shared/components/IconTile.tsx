import type { ReactNode } from 'react'

interface IconTileProps {
  icon: ReactNode
  label: string
  color: string
  onClick: () => void
}

export function IconTile({ icon, label, color, onClick }: IconTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="neu-raised flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl p-6 transition-all duration-150 hover:scale-[1.04] active:neu-pressed active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate-700"
    >
      <span
        className="flex h-20 w-20 items-center justify-center rounded-2xl p-3 text-white shadow-[3px_3px_6px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: color }}
      >
        {icon}
      </span>
      <span className="text-center text-xl font-bold leading-tight text-slate-800">{label}</span>
    </button>
  )
}
