import { createBrowserRouter, Navigate } from 'react-router-dom'
import { SeleccionLaborScreen, TrabajadoresScreen, CapturaRegistroScreen } from '../features/captura'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/captura/labor" replace /> },
  { path: '/captura/labor', element: <SeleccionLaborScreen /> },
  { path: '/captura/labor/:tipoLaborId/trabajadores', element: <TrabajadoresScreen /> },
  { path: '/captura/labor/:tipoLaborId/trabajadores/:trabajadorId', element: <CapturaRegistroScreen /> },
])
