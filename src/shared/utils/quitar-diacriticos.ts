export function quitarDiacriticos(valor: string): string {
  return valor.normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
}
