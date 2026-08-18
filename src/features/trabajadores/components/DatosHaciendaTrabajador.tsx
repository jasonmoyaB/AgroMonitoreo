import { useContribuyenteHacienda } from '../../../shared/hooks/use-contribuyente-hacienda'
import { describirSituacionHacienda } from '../../../shared/utils/describir-situacion-hacienda'
import { DatoTrabajador } from './DatoTrabajador'

interface DatosHaciendaTrabajadorProps {
  cedula: string | null
}

export function DatosHaciendaTrabajador({ cedula }: DatosHaciendaTrabajadorProps) {
  const { contribuyente, isFetching, noEncontrado, isError } = useContribuyenteHacienda(cedula ?? '')

  // sin cedula no hay nada que consultar, y la fila "Cédula: Sin registrar" que
  // esta justo arriba ya lo explica: una segunda leyenda seria ruido
  if (!cedula) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-green-800">Hacienda</h3>

      {isFetching && <p className="font-bold text-slate-600">Consultando Hacienda...</p>}

      {isError && <p className="font-bold text-amber-700">No se pudo consultar Hacienda.</p>}

      {/* no estar inscrito es lo normal en un asalariado: se informa, no se alarma */}
      {noEncontrado && <p className="font-bold text-slate-500">Esta cédula no aparece inscrita en Hacienda.</p>}

      {contribuyente && (
        <dl className="flex flex-col gap-2">
          <DatoTrabajador etiqueta="Nombre registrado" valor={contribuyente.nombre} />
          <DatoTrabajador etiqueta="Régimen" valor={contribuyente.regimen} />
          <DatoTrabajador etiqueta="Situación" valor={describirSituacionHacienda(contribuyente)} />
        </dl>
      )}
    </section>
  )
}
