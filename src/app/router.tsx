import { createBrowserRouter, Navigate } from 'react-router-dom'
import { SeleccionLaborScreen, TrabajadoresScreen, CapturaRegistroScreen } from '../features/captura'
import { AuthGuard, LoginScreen, RegisterScreen } from '../features/auth'
import { AgregarTrabajadorScreen, SupervisorDashboardScreen } from '../features/supervisor'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/supervisor" replace /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/registro', element: <RegisterScreen /> },
  {
    element: <AuthGuard />,
    children: [
      { path: '/supervisor', element: <SupervisorDashboardScreen /> },
      { path: '/supervisor/trabajadores/nuevo', element: <AgregarTrabajadorScreen /> },
      { path: '/captura/labor', element: <SeleccionLaborScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores', element: <TrabajadoresScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores/:trabajadorId', element: <CapturaRegistroScreen /> },
    ],
  },
])
