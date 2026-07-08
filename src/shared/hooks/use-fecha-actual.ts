import { useEffect, useState } from 'react'

const INTERVALO_ACTUALIZACION_MS = 60_000

export function useFechaActual(): Date {
  const [fecha, setFecha] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => setFecha(new Date()), INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalId)
  }, [])

  return fecha
}
