import type { FilaPlanilla, GrupoSeguro } from '../types/planilla.types'

export function filtrarFilasPorSeguro(filas: readonly FilaPlanilla[], grupo: GrupoSeguro): FilaPlanilla[] {
  const asegurado = grupo === 'asegurados'
  return filas.filter((fila) => fila.asegurado === asegurado)
}
