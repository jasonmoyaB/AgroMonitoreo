import { AlertTriangle, WifiOff } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorScreen } from '../shared/components/ErrorScreen'

function recargar() {
  window.location.reload()
}

export function RouteErrorScreen() {
  const error = useRouteError()

  if (!navigator.onLine) {
    return (
      <ErrorScreen
        icon={WifiOff}
        titulo="Sin conexión a internet"
        mensaje="No pudimos cargar esta pantalla porque no hay señal. Revisá tu conexión y volvé a intentar."
        accion={{ label: 'Reintentar', onClick: recargar }}
      />
    )
  }

  const detalle = isRouteErrorResponse(error) ? `Error ${error.status}` : undefined

  return (
    <ErrorScreen
      icon={AlertTriangle}
      titulo="Algo salió mal"
      mensaje={
        detalle
          ? `No pudimos mostrar esta pantalla (${detalle}). Recargá la página para seguir trabajando.`
          : 'La página tuvo un problema inesperado. Recargá para seguir trabajando.'
      }
      accion={{ label: 'Recargar página', onClick: recargar }}
    />
  )
}
