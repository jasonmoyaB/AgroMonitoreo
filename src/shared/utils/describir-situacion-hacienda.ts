import type { ContribuyenteHacienda } from '../types/hacienda.types'

type SituacionContribuyente = Pick<ContribuyenteHacienda, 'estado' | 'moroso' | 'omiso'>

/** "Inscrito", "Inscrito (moroso)", "Inscrito (moroso y omiso)". */
export function describirSituacionHacienda({ estado, moroso, omiso }: SituacionContribuyente): string {
  const marcas: string[] = []
  if (moroso) marcas.push('moroso')
  if (omiso) marcas.push('omiso')

  const detalle = marcas.length ? `(${marcas.join(' y ')})` : ''

  // filter(Boolean) para que un estado vacio no deje un espacio colgando adelante
  return [estado, detalle].filter((parte) => parte !== '').join(' ')
}
