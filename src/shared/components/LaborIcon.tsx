import { Wheat, Link2, Scissors, LeafyGreen, PocketKnife, Shovel, Sprout, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LaborIconName } from '../types/domain.types'

const ICONOS_POR_NOMBRE: Record<LaborIconName, LucideIcon> = {
  wheat: Wheat,
  link: Link2,
  scissors: Scissors,
  leaf: LeafyGreen,
  knife: PocketKnife,
  shovel: Shovel,
  sprout: Sprout,
  package: Package,
}

interface LaborIconProps {
  name: LaborIconName
  className?: string
}

export function LaborIcon({ name, className }: LaborIconProps) {
  const Icon = ICONOS_POR_NOMBRE[name]
  return <Icon className={className} aria-hidden="true" />
}
