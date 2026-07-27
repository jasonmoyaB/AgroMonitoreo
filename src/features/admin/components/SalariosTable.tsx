import { Avatar } from '../../../shared/components/Avatar'
import type { Trabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40
const QUINCENA_DIVISOR = 2

interface SalariosTableProps {
  trabajadores: readonly Trabajador[]
  isLoading: boolean
  onCambiarSalario: (input: { id: string; salarioMensual: number; moneda: Trabajador['moneda'] }) => void
}

export function SalariosTable({ trabajadores, isLoading, onCambiarSalario }: SalariosTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando salarios.</p>
  if (!trabajadores.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Esta finca no tiene trabajadores registrados.</p>

  return (
    <div className="neu-raised overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-900/10">
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Trabajador</th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Salario mensual</th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Moneda</th>
              <th scope="col" className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">Quincena</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <tr key={trabajador.id} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar nombre={trabajador.nombreCompleto} fotoUrl={trabajador.fotoUrl} size={AVATAR_SIZE_PX} />
                    <span className="truncate text-base font-black text-slate-900">{trabajador.nombreCompleto}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={trabajador.salarioMensual}
                    onBlur={(e) => onCambiarSalario({ id: trabajador.id, salarioMensual: Number(e.target.value), moneda: trabajador.moneda })}
                    aria-label={`Salario mensual de ${trabajador.nombreCompleto}`}
                    className="neu-pressed min-h-11 w-32 rounded-xl px-3 font-bold text-slate-900"
                  />
                </td>
                <td className="px-5 py-3">
                  <select
                    defaultValue={trabajador.moneda}
                    onChange={(e) => onCambiarSalario({ id: trabajador.id, salarioMensual: trabajador.salarioMensual, moneda: e.target.value as Trabajador['moneda'] })}
                    aria-label={`Moneda de ${trabajador.nombreCompleto}`}
                    className="neu-pressed min-h-11 rounded-xl px-3 font-bold text-slate-900"
                  >
                    <option value="colones">Colones</option>
                    <option value="usd">USD</option>
                  </select>
                </td>
                <td className="px-5 py-3 font-black text-slate-700">{(trabajador.salarioMensual / QUINCENA_DIVISOR).toLocaleString('es-CR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
