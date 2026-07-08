import { Link } from 'react-router-dom'
import { LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Sprout, UserPlus } from 'lucide-react'

interface SupervisorSidebarProps {
  isCollapsed: boolean
  isSigningOut: boolean
  onToggle: () => void
  onSignOut: () => void
}

export function SupervisorSidebar({ isCollapsed, isSigningOut, onToggle, onSignOut }: SupervisorSidebarProps) {
  const labelClass = isCollapsed ? 'sr-only' : 'truncate'
  const sidebarWidth = isCollapsed ? 'md:w-20' : 'md:w-72'

  return (
    <aside className={`neu-raised flex shrink-0 flex-col rounded-[2rem] p-3 ${sidebarWidth} md:h-full`}>
      <div className="flex items-center justify-between gap-2">
        <Link to="/supervisor" className="flex min-h-12 min-w-0 items-center gap-3 rounded-2xl px-2 text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
            <Sprout className="h-5 w-5" aria-hidden="true" />
          </span>
          {!isCollapsed && <span className="text-sm font-black tracking-tight">AgroMonitoreo</span>}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl text-green-900 transition-colors duration-200 hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="mt-3 md:mt-8 md:flex md:flex-1 md:flex-col" aria-label="Supervisor">
        <Link className="neu-pressed flex min-h-12 items-center gap-3 rounded-2xl px-3 font-black text-green-900" to="/supervisor">
          <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className={labelClass}>Dashboard</span>
        </Link>
        <Link className="mt-2 flex min-h-12 items-center gap-3 rounded-2xl px-3 font-bold text-slate-700 transition-colors duration-200 hover:bg-white/45" to="/supervisor/trabajadores/nuevo">
          <UserPlus className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className={labelClass}>Agregar trabajador</span>
        </Link>
      </nav>

      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="mt-2 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 font-bold text-slate-700 transition-colors duration-200 hover:bg-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900 disabled:cursor-not-allowed disabled:opacity-60 md:mt-8"
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className={labelClass}>{isSigningOut ? 'Saliendo' : 'Salir'}</span>
      </button>
    </aside>
  )
}
