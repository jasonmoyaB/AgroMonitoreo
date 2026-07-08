interface ProgresoDelDiaProps {
  registrados: number
  total: number
}

export function ProgresoDelDia({ registrados, total }: ProgresoDelDiaProps) {
  return (
    <div className="sticky bottom-0 bg-white/95 p-4 text-center text-xl font-bold text-slate-700 shadow-inner">
      {registrados} de {total} registrados
    </div>
  )
}
