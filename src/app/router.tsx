import { createBrowserRouter, Navigate } from 'react-router-dom'
import { SeleccionFechaScreen, TrabajadoresScreen, CapturaRegistroScreen } from '../features/captura'
import { AdminGuard, AuthGuard, LoginScreen, RegisterScreen } from '../features/auth'
import { AsistenciaScreen, DashboardScreen, SupervisorDashboardScreen, TrabajadoresCrudScreen } from '../features/supervisor'
import { AdminDashboardScreen, AsistenciaPorFincaScreen, FincasCrudScreen, TrabajadoresPorFincaScreen } from '../features/admin'
import { NotFoundScreen } from './NotFoundScreen'

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
      { path: '/supervisor/asistencia', element: <AsistenciaScreen /> },
      { path: '/supervisor/trabajadores/nuevo', element: <Navigate to="/supervisor/trabajadores" replace /> },
      { path: '/captura/fecha', element: <SeleccionFechaScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores', element: <TrabajadoresScreen /> },
      { path: '/captura/labor/:tipoLaborId/trabajadores/:trabajadorId', element: <CapturaRegistroScreen /> },
    ],
  },
  {
    element: <AdminGuard />,
    children: [
      { path: '/admin', element: <AdminDashboardScreen /> },
      { path: '/admin/fincas', element: <FincasCrudScreen /> },
      { path: '/admin/trabajadores', element: <TrabajadoresPorFincaScreen /> },
      { path: '/admin/asistencia', element: <AsistenciaPorFincaScreen /> },
    ],
  },
  { path: '*', element: <NotFoundScreen /> },
])
