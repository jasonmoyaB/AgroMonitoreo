import { LogOut, UserRound } from 'lucide-react'

interface SupervisorProfileButtonProps {
  isSigningOut: boolean
  onSignOut: () => void
}

export function SupervisorProfileButton({ isSigningOut, onSignOut }: SupervisorProfileButtonProps) {
  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={isSigningOut}
      className="neu-raised flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left text-slate-800 transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
      aria-label="Cerrar sesión del supervisor"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-green-800">Supervisor</span>
        <span className="text-sm font-black">{isSigningOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
      </span>
      <LogOut className="ml-auto h-5 w-5 text-green-800" aria-hidden="true" />
    </button>
  )
}
