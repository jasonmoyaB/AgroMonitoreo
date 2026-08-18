import { INPUT_NEU_CLASS } from '../constants/campos.constants'

interface CampoTextoProps {
  etiqueta: string
  valor: string
  onChange: (valor: string) => void
  tipo?: 'text' | 'date' | 'tel' | 'email'
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
