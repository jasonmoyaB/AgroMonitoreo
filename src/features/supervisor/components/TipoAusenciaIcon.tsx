import { Palmtree, FileText, Stethoscope } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoAusencia } from '../../../shared/types/domain.types'

const ICONOS_POR_TIPO: Record<TipoAusencia, LucideIcon> = {
  vacaciones: Palmtree,
  permisos: FileText,
  permisos_medicos: Stethoscope,
}

interface TipoAusenciaIconProps {
  tipo: TipoAusencia
  className?: string
}

export function TipoAusenciaIcon({ tipo, className }: TipoAusenciaIconProps) {
  const Icon = ICONOS_POR_TIPO[tipo]
  return <Icon className={className} aria-hidden="true" />
}
