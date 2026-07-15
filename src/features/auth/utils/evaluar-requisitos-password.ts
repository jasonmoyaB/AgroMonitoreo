import { PASSWORD_MIN_LENGTH } from '../constants/password.constants'

export interface RequisitoPassword {
  texto: string
  cumplido: boolean
}

export function evaluarRequisitosPassword(password: string): RequisitoPassword[] {
  return [
    { texto: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`, cumplido: password.length >= PASSWORD_MIN_LENGTH },
    { texto: 'Una mayúscula', cumplido: /[A-Z]/.test(password) },
    { texto: 'Una minúscula', cumplido: /[a-z]/.test(password) },
    { texto: 'Un número', cumplido: /[0-9]/.test(password) },
  ]
}
