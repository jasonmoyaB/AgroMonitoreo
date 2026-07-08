export interface RangoLetras {
  etiqueta: string
  desde: string
  hasta: string
}

export const RANGOS_ALFABETO: readonly RangoLetras[] = [
  { etiqueta: 'A-F', desde: 'A', hasta: 'F' },
  { etiqueta: 'G-M', desde: 'G', hasta: 'M' },
  { etiqueta: 'N-S', desde: 'N', hasta: 'S' },
  { etiqueta: 'T-Z', desde: 'T', hasta: 'Z' },
]
