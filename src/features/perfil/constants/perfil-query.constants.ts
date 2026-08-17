import type { DatosPersonalesUsuario } from '../types/perfil.types'

export const DATOS_PERSONALES_QUERY_KEY = ['perfil', 'datos-personales']

export const DATOS_PERSONALES_VACIOS: DatosPersonalesUsuario = {
  telefono: '',
  emailContacto: '',
  cedula: '',
  fechaNacimiento: '',
  direccion: '',
  contactoEmergencia: '',
}
