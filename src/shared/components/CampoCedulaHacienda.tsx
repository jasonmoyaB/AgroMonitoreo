import { useContribuyenteHacienda } from '../hooks/use-contribuyente-hacienda'
import { describirSituacionHacienda } from '../utils/describir-situacion-hacienda'
import { CampoTexto } from './CampoTexto'
import type { ContribuyenteHacienda } from '../types/hacienda.types'

interface CampoCedulaHaciendaProps {
  valor: string
  onChange: (valor: string) => void
  onNombreEncontrado?: (nombre: string) => void
}

export function CampoCedulaHacienda({ valor, onChange, onNombreEncontrado }: CampoCedulaHaciendaProps) {
  const consulta = useContribuyenteHacienda(valor, onNombreEncontrado)

  return (
    <div>
      <CampoTexto etiqueta="Cédula" valor={valor} onChange={onChange} ayuda="Opcional. Se consulta en Hacienda al completarla." />
      <p className={`mt-2 text-sm font-bold ${colorEstado(consulta)}`} aria-live="polite">
        {mensajeEstado(consulta)}
      </p>
    </div>
  )
}

type EstadoConsulta = {
  contribuyente: ContribuyenteHacienda | null
  isFetching: boolean
  noEncontrado: boolean
  isError: boolean
}

function mensajeEstado({ contribuyente, isFetching, noEncontrado, isError }: EstadoConsulta): string {
  if (isFetching) return 'Consultando Hacienda...'
  if (isError) return 'No se pudo consultar Hacienda. Podés escribir los datos a mano.'
  // no estar inscrito es lo normal en un asalariado: se informa, no se alarma
  if (noEncontrado) return 'No aparece inscrito en Hacienda. Podés escribir los datos a mano.'
  if (!contribuyente) return ''

  return `${contribuyente.nombre} — ${describirSituacionHacienda(contribuyente)}`
}

function colorEstado({ contribuyente, isFetching, noEncontrado, isError }: EstadoConsulta): string {
  if (isFetching || noEncontrado) return 'text-slate-500'
  if (isError) return 'text-amber-700'
  if (!contribuyente) return 'text-slate-500'
  return contribuyente.moroso || contribuyente.omiso ? 'text-amber-700' : 'text-green-800'
}
