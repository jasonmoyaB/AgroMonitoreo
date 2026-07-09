import {
  FIRMA_BINARIA_POR_MIME,
  TAMANO_MAXIMO_BYTES,
  TIPOS_MIME_PERMITIDOS,
  type TipoMimePermitido,
} from '../constants/foto-trabajador.constants'

export interface ValidacionFoto {
  valido: boolean
  error: string | null
}

function esTipoPermitido(tipo: string): tipo is TipoMimePermitido {
  return (TIPOS_MIME_PERMITIDOS as readonly string[]).includes(tipo)
}

async function coincideFirmaBinaria(archivo: File, tipo: TipoMimePermitido): Promise<boolean> {
  const encabezado = new Uint8Array(await archivo.slice(0, 12).arrayBuffer())
  const firma = FIRMA_BINARIA_POR_MIME[tipo]
  const coincideInicio = firma.every((byte, index) => encabezado[index] === byte)
  if (tipo !== 'image/webp') return coincideInicio

  const esRiffWebp = encabezado[8] === 0x57 && encabezado[9] === 0x45 && encabezado[10] === 0x42 && encabezado[11] === 0x50
  return coincideInicio && esRiffWebp
}

export async function validarFotoTrabajador(archivo: File): Promise<ValidacionFoto> {
  if (!esTipoPermitido(archivo.type)) {
    return { valido: false, error: 'Solo se permiten fotos JPG, PNG o WEBP.' }
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return { valido: false, error: 'La foto pesa demasiado. Máximo 5 MB.' }
  }
  if (!(await coincideFirmaBinaria(archivo, archivo.type))) {
    return { valido: false, error: 'El archivo no es una imagen válida.' }
  }
  return { valido: true, error: null }
}
