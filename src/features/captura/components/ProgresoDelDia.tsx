interface ProgresoDelDiaProps {
  registrados: number
  total: number
}

export function ProgresoDelDia({ registrados, total }: ProgresoDelDiaProps) {
  return (
    <div className="neu-raised sticky bottom-0 rounded-t-3xl p-4 text-center text-xl font-bold text-slate-700">
      {registrados} de {total} registrados
    </div>
  )
}
