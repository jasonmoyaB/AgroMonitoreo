import { Avatar } from '../../../shared/components/Avatar'
import { calcularMontoQuincena } from '../../../shared/utils/calcular-monto-quincena'
import { formatearMonto } from '../../../shared/utils/formatear-monto'
import { leerNumeroNoNegativo } from '../../../shared/utils/leer-numero-no-negativo'
import type { Moneda, SalarioTrabajador } from '../../../shared/types/domain.types'

const AVATAR_SIZE_PX = 40

interface SalariosTableProps {
  salarios: readonly SalarioTrabajador[]
  isLoading: boolean
  onGuardar: (input: { trabajadorId: string; salarioMensual?: number; moneda?: Moneda }) => void
}

export function SalariosTable({ salarios, isLoading, onGuardar }: SalariosTableProps) {
  if (isLoading) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Cargando salarios.</p>
  if (!salarios.length) return <p className="neu-raised rounded-3xl p-5 font-black text-slate-700">Esta finca no tiene trabajadores registrados.</p>

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
            {salarios.map((salario) => (
              <tr key={salario.trabajadorId} className="border-b border-slate-900/5 last:border-b-0">
                <td className="px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar nombre={salario.nombreCompleto} fotoUrl={salario.fotoUrl} size={AVATAR_SIZE_PX} />
                    <span className="truncate text-base font-black text-slate-900">{salario.nombreCompleto}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={salario.salarioMensual}
                    onBlur={(e) => {
                      const salarioMensual = leerNumeroNoNegativo(e.target.value)
                      if (salarioMensual === null) {
                        e.target.value = String(salario.salarioMensual)
                        return
                      }
                      // solo el salario: la moneda la manda su propio control. mandar los
                      // dos campos hacia que cambiar la moneda reescribiera el salario con
                      // el valor de props, todavia sin refrescar
                      onGuardar({ trabajadorId: salario.trabajadorId, salarioMensual })
                    }}
                    aria-label={`Salario mensual de ${salario.nombreCompleto}`}
                    className="neu-pressed min-h-11 w-32 rounded-xl px-3 font-bold text-slate-900"
                  />
                </td>
                <td className="px-5 py-3">
                  <select
                    defaultValue={salario.moneda}
                    onChange={(e) => onGuardar({ trabajadorId: salario.trabajadorId, moneda: e.target.value as Moneda })}
                    aria-label={`Moneda de ${salario.nombreCompleto}`}
                    className="neu-pressed min-h-11 rounded-xl px-3 font-bold text-slate-900"
                  >
                    <option value="colones">Colones</option>
                    <option value="usd">USD</option>
                  </select>
                </td>
                <td className="px-5 py-3 font-black text-slate-700">{formatearMonto(calcularMontoQuincena(salario.salarioMensual, salario.moneda), salario.moneda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
