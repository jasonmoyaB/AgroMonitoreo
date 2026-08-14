export const INPUT_NEU_CLASS =
  'neu-pressed min-h-16 rounded-2xl px-4 text-xl font-black text-slate-900 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900'

interface CampoTextoProps {
  etiqueta: string
  valor: string
  onChange: (valor: string) => void
  tipo?: 'text' | 'date' | 'tel'
  ayuda?: string
}

export function CampoTexto({ etiqueta, valor, onChange, tipo = 'text', ayuda }: CampoTextoProps) {
  return (
    <label className="flex flex-col gap-2 font-black text-slate-800">
      {etiqueta}
      <input type={tipo} value={valor} onChange={(event) => onChange(event.target.value)} className={INPUT_NEU_CLASS} />
      {ayuda && <span className="text-xs font-bold text-slate-500">{ayuda}</span>}
    </label>
  )
}
