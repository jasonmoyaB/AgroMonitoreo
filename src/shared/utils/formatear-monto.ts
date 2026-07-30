import type { Moneda } from '../types/domain.types'

const SIN_DECIMALES = 0
const DOS_DECIMALES = 2

// un formatter por moneda, construido una sola vez al cargar el modulo: crear un
// Intl.NumberFormat es caro y esto se llama por cada celda de la planilla
const FORMATTERS: Record<Moneda, Intl.NumberFormat> = {
  colones: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: SIN_DECIMALES, maximumFractionDigits: SIN_DECIMALES }),
  usd: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: DOS_DECIMALES, maximumFractionDigits: DOS_DECIMALES }),
}

// formatear siempre con la moneda de la fila: toLocaleString('es-CR') a secas pintaba
// un salario en usd como si fueran colones.
export function formatearMonto(monto: number, moneda: Moneda): string {
  return FORMATTERS[moneda].format(monto)
}
