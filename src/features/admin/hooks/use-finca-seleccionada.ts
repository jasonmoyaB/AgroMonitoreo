import { useState } from 'react'
import type { Finca } from '../../../shared/types/domain.types'
import { useFincas } from './use-fincas'

// mientras el admin no elige, cae en la primera finca de la lista: fincas llega vacio
// en el primer render y sin el fallback la pantalla queda sin nada seleccionado.
export function useFincaSeleccionada() {
  const { fincas } = useFincas()
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null)
  const fincaId = seleccionadaId ?? fincas[0]?.id ?? null
  const finca: Finca | null = fincas.find((item) => item.id === fincaId) ?? null

  return { fincas, fincaId, finca, seleccionar: setSeleccionadaId }
}
