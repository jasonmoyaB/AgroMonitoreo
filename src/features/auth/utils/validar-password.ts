import { evaluarRequisitosPassword } from './evaluar-requisitos-password'

export function validarPassword(password: string): string | null {
  const requisitoIncumplido = evaluarRequisitosPassword(password).find((requisito) => !requisito.cumplido)
  return requisitoIncumplido ? `La contraseña debe cumplir: ${requisitoIncumplido.texto.toLowerCase()}.` : null
}
