import { createBrowserRouter, Navigate } from 'react-router-dom'
import { SeleccionLaborScreen, SeleccionFechaScreen, TrabajadoresScreen, CapturaRegistroScreen } from '../features/captura'
import { AuthGuard, LoginScreen, RegisterScreen } from '../features/auth'
import { DashboardScreen, SupervisorDashboardScreen, TrabajadoresCrudScreen } from '../features/supervisor'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/supervisor" replace /> },
  { path: '/login', element: <LoginScreen /> },
  { path: '/registro', element: <RegisterScreen /> },
  {
    element: <AuthGuard />,
    children: [
      { path: '/supervisor', element: <SupervisorDashboardScreen /> },
      { path: '/supervisor/dashboard', element: <DashboardScreen /> },
      { path: '/supervisor/trabajadores', element: <TrabajadoresCrudScreen /> },
      { path: '/supervisor/trabajadores/nuevo', element: <Navigate to="/supervisor/trabajadores" replace /> },
      { path: '/captura/fecha', element: <SeleccionFechaScreen /> },
      { path: '/captura/labor', element: <SeleccionLaborScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores', element: <TrabajadoresScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores/:trabajadorId', element: <CapturaRegistroScreen /> },
    ],
  },
  { path: '*', element: <Navigate to="/supervisor" replace /> },
])
