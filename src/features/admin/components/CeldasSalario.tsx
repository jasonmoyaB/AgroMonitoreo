import { leerNumeroNoNegativo } from '../../../shared/utils/leer-numero-no-negativo'
import type { Moneda } from '../../../shared/types/domain.types'
import type { EdicionSalario, FilaPlanilla } from '../../planilla/types/planilla.types'

interface CeldasSalarioProps {
  fila: FilaPlanilla
  onGuardar: (input: EdicionSalario) => void
}

// las dos celdas editables de la planilla. cada control manda solo su campo: mandar los
// dos juntos hacia que cambiar la moneda reescribiera el salario con el valor de props,
// todavia sin refrescar. el salario es dato del trabajador, no de la quincena, asi que
// se edita tambien en una fila ya pagada: el monto pagado sigue siendo el snapshot.
export function CeldasSalario({ fila, onGuardar }: CeldasSalarioProps) {
  return (
    <>
      <td className="px-5 py-3">
        <input
          type="number"
          min={0}
          step="0.01"
          defaultValue={fila.salarioMensual}
          key={`${fila.trabajadorId}-${fila.salarioMensual}`}
          onBlur={(event) => {
            const salarioMensual = leerNumeroNoNegativo(event.target.value)
            if (salarioMensual === null) {
              event.target.value = String(fila.salarioMensual)
              return
            }
            if (salarioMensual === fila.salarioMensual) return
            onGuardar({ trabajadorId: fila.trabajadorId, salarioMensual })
          }}
          aria-label={`Salario mensual de ${fila.nombreCompleto}`}
          className="neu-pressed min-h-11 w-32 rounded-xl px-3 font-bold text-slate-900"
        />
      </td>
      <td className="px-5 py-3">
        <select
          value={fila.moneda}
          onChange={(event) => onGuardar({ trabajadorId: fila.trabajadorId, moneda: event.target.value as Moneda })}
          aria-label={`Moneda de ${fila.nombreCompleto}`}
          className="neu-pressed min-h-11 cursor-pointer rounded-xl px-3 font-bold text-slate-900"
        >
          <option value="colones">Colones</option>
          <option value="usd">USD</option>
        </select>
      </td>
    </>
  )
}
