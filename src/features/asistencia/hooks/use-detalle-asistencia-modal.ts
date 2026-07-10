import { useState } from 'react'
import type { Trabajador } from '../../../shared/types/domain.types'

export function useDetalleAsistenciaModal() {
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null)

  return {
    trabajador,
    isOpen: trabajador !== null,
    abrir: setTrabajador,
    cerrar: () => setTrabajador(null),
  }
}
