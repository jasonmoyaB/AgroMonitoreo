import { useState } from 'react'
import { validarFotoTrabajador } from '../utils/validar-foto-trabajador'

function revocarSiEsBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

export function useFotoTrabajador() {
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null)
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null)
  const [fotoError, setFotoError] = useState<string | null>(null)

  function reiniciarFoto(fotoUrlActual: string | null) {
    setFotoPreviewUrl((previa) => {
      revocarSiEsBlob(previa)
      return fotoUrlActual
    })
    setFotoArchivo(null)
    setFotoError(null)
  }

  async function seleccionarFoto(archivo: File | null) {
    if (!archivo) {
      reiniciarFoto(null)
      return
    }
    const validacion = await validarFotoTrabajador(archivo)
    if (!validacion.valido) {
      setFotoError(validacion.error)
      return
    }
    setFotoError(null)
    setFotoArchivo(archivo)
    setFotoPreviewUrl((previa) => {
      revocarSiEsBlob(previa)
      return URL.createObjectURL(archivo)
    })
  }

  return { fotoArchivo, fotoPreviewUrl, fotoError, seleccionarFoto, reiniciarFoto }
}
