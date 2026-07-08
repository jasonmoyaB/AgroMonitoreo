import { Search, X } from 'lucide-react'

interface BuscadorTrabajadorProps {
  valor: string
  onChange: (valor: string) => void
}

export function BuscadorTrabajador({ valor, onChange }: BuscadorTrabajadorProps) {
  return (
    <div className="neu-well mx-4 flex min-h-14 items-center gap-3 rounded-2xl px-4">
      <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
      <input
        type="text"
        inputMode="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="Buscar trabajador"
        aria-label="Buscar trabajador por nombre"
        className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-transform active:scale-95"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
