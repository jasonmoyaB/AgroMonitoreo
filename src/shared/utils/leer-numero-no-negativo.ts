// los inputs numericos de admin (salario, valor hora) aceptan lo que sea: vacio, texto,
// negativos, Infinity. devuelve null cuando el valor no sirve, para que el llamador
// restaure el valor previo en vez de mandar NaN a la BD.
export function leerNumeroNoNegativo(valor: string): number | null {
  const limpio = valor.trim()
  if (limpio === '') return null

  const numero = Number(limpio)
  if (!Number.isFinite(numero) || numero < 0) return null

  return numero
}
