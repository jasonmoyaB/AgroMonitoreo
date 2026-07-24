interface WizardProgressDotsProps {
  paso: number
  totalPasos: number
}

export function WizardProgressDots({ paso, totalPasos }: WizardProgressDotsProps) {
  const pasos = Array.from({ length: totalPasos }, (_, indice) => indice + 1)

  return (
    <div className="flex items-center gap-2" role="presentation">
      {pasos.map((numeroPaso) => (
        <span
          key={numeroPaso}
          className={`h-2.5 rounded-full transition-all duration-200 ${
            numeroPaso === paso ? 'w-7 bg-emerald-600' : 'w-2.5 bg-slate-300'
          }`}
        />
      ))}
    </div>
  )
}
