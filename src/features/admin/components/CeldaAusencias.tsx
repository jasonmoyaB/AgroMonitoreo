import { formatearMonto } from '../../../shared/utils/formatear-monto'
import type { FilaPlanilla } from '../../planilla/types/planilla.types'

interface CeldaAusenciasProps {
  fila: FilaPlanilla
  resumen: { diasAusentes: number; deduccion: number; moneda: FilaPlanilla['moneda'] }
  onVer: (fila: FilaPlanilla) => void
}

// solo es boton cuando hay fechas que mostrar: una fila pagada conserva el conteo del
// snapshot aunque despues borren las ausencias, y el modal quedaria vacio
export function CeldaAusencias({ fila, resumen, onVer }: CeldaAusenciasProps) {
  const { diasAusentes, deduccion, moneda } = resumen
  if (diasAusentes === 0) return <span className="font-bold text-slate-400">—</span>

  const etiqueta = `${diasAusentes} ${diasAusentes === 1 ? 'día' : 'días'} · −${formatearMonto(deduccion, moneda)}`
  if (fila.ausencias.length === 0) return <span className="font-black text-amber-700">{etiqueta}</span>

  return (
    <button
      type="button"
      onClick={() => onVer(fila)}
      title="Ver qué días faltó"
      className="min-h-11 cursor-pointer rounded-xl px-2 font-black text-amber-700 underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-900"
    >
      {etiqueta}
    </button>
  )
}
