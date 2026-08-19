const DECIMALES_MAXIMOS = 1

// Cantidades de produccion y horas: un decimal alcanza (5,5 horas) y mas ruido visual
// no aporta. Los montos de dinero NO pasan por aca, van por formatear-monto.ts, que
// necesita la moneda de la fila para no pintar un salario en USD como si fueran colones.
export function formatearCantidad(valor: number): string {
  return valor.toLocaleString('es-CL', { maximumFractionDigits: DECIMALES_MAXIMOS })
}
