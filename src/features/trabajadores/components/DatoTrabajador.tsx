const SIN_DATO = 'Sin registrar'

interface DatoTrabajadorProps {
  etiqueta: string
  valor: string | null
}

/** Fila etiqueta/valor de las fichas de trabajador. Va dentro de un <dl>. */
export function DatoTrabajador({ etiqueta, valor }: DatoTrabajadorProps) {
  return (
    <div className="neu-well flex flex-wrap items-baseline justify-between gap-2 rounded-2xl px-4 py-3">
      <dt className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">{etiqueta}</dt>
      <dd className={`text-base font-black ${valor ? 'text-slate-900' : 'text-slate-400'}`}>{valor || SIN_DATO}</dd>
    </div>
  )
}
