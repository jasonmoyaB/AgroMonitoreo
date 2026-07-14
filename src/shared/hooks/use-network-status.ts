import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [enLinea, setEnLinea] = useState(navigator.onLine)

  useEffect(() => {
    const marcarEnLinea = () => setEnLinea(true)
    const marcarSinConexion = () => setEnLinea(false)

    window.addEventListener('online', marcarEnLinea)
    window.addEventListener('offline', marcarSinConexion)

    return () => {
      window.removeEventListener('online', marcarEnLinea)
      window.removeEventListener('offline', marcarSinConexion)
    }
  }, [])

  return enLinea
}
