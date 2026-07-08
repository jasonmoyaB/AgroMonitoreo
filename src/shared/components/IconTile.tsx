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
      className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-3xl p-6 text-white shadow-lg transition-transform active:scale-95"
      style={{ backgroundColor: color }}
    >
      <span className="h-16 w-16">{icon}</span>
      <span className="text-center text-xl font-bold leading-tight">{label}</span>
    </button>
  )
}
