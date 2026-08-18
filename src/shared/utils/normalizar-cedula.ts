import { CEDULA_LARGO_MAXIMO, CEDULA_LARGO_MINIMO } from '../constants/hacienda.constants'

/**
 * Hacienda quiere solo digitos, pero la gente escribe la cedula como la ve en el
 * carne: "1-0234-0567". Se limpia todo lo que no sea numero.
 */
export function normalizarCedula(cedula: string): string {
  return cedula.replace(/\D/g, '')
}

/** Si no llega al largo minimo no se consulta: seria un 400 seguro por cada tecla. */
export function esCedulaConsultable(cedulaNormalizada: string): boolean {
  return cedulaNormalizada.length >= CEDULA_LARGO_MINIMO && cedulaNormalizada.length <= CEDULA_LARGO_MAXIMO
}
