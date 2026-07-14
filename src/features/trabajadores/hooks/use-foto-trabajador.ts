import { useState } from 'react'
import { validarFotoTrabajador } from '../utils/validar-foto-trabajador'

function revocarSiEsBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

interface EstadoFoto {
  fotoArchivo: File | null
  fotoPreviewUrl: string | null
  fotoError: string | null
}

export function useFotoTrabajador() {
  const [estado, setEstado] = useState<EstadoFoto>({ fotoArchivo: null, fotoPreviewUrl: null, fotoError: null })
  const { fotoArchivo, fotoPreviewUrl, fotoError } = estado

  function reiniciarFoto(fotoUrlActual: string | null) {
    revocarSiEsBlob(fotoPreviewUrl)
    setEstado({ fotoArchivo: null, fotoPreviewUrl: fotoUrlActual, fotoError: null })
  }

  async function seleccionarFoto(archivo: File | null) {
    if (!archivo) {
      reiniciarFoto(null)
      return
    }
    const validacion = await validarFotoTrabajador(archivo)
    if (!validacion.valido) {
      setEstado((actual) => ({ ...actual, fotoError: validacion.error }))
      return
    }
    revocarSiEsBlob(fotoPreviewUrl)
    setEstado({ fotoArchivo: archivo, fotoPreviewUrl: URL.createObjectURL(archivo), fotoError: null })
  }

  return { fotoArchivo, fotoPreviewUrl, fotoError, seleccionarFoto, reiniciarFoto }
}
