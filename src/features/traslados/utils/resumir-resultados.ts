export interface ResumenEnvio {
  exitosos: number
  fallidos: number
  primerError: string | null
}

// Promise.all corta en el primer rechazo y deja las escrituras que si entraron sin
// reportar. allSettled + este resumen permite decir cuantas pasaron de verdad.
export function resumirResultados(resultados: readonly PromiseSettledResult<unknown>[]): ResumenEnvio {
  const rechazados = resultados.filter((resultado) => resultado.status === 'rejected')
  const primero = rechazados[0]

  return {
    exitosos: resultados.length - rechazados.length,
    fallidos: rechazados.length,
    primerError: primero ? mensajeDeError(primero.reason) : null,
  }
}

function mensajeDeError(razon: unknown): string {
  return razon instanceof Error ? razon.message : String(razon)
}
