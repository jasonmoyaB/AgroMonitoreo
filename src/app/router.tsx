import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import {
  SeleccionFechaScreen,
  TrabajadoresScreen,
  CapturaRegistroScreen,
} from "../features/captura";
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  RouteGuard,
} from "../features/auth";
import {
  AsistenciaScreen,
  DashboardScreen,
  SupervisorConfiguracionScreen,
  SupervisorDashboardScreen,
  TrabajadoresCrudScreen,
  TrasladosScreen,
} from "../features/supervisor";
import {
  AdminConfiguracionScreen,
  AdminDashboardScreen,
  AsistenciaPorFincaScreen,
  FincaDashboardScreen,
  FincasCrudScreen,
  PlanillaScreen,
  SupervisoresCrudScreen,
  TrabajadoresPorFincaScreen,
  TrasladosAdminScreen,
} from "../features/admin";
import { NotFoundScreen } from "./NotFoundScreen";
import { RouteErrorScreen } from "./RouteErrorScreen";

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorScreen />,
    children: [
      { path: "/", element: <Navigate to="/supervisor" replace /> },
      { path: "/login", element: <LoginScreen /> },
      { path: "/registro", element: <RegisterScreen /> },
      { path: "/olvide-password", element: <ForgotPasswordScreen /> },
      { path: "/reset-password", element: <ResetPasswordScreen /> },
      {
        element: <RouteGuard />,
        children: [
          { path: "/supervisor", element: <SupervisorDashboardScreen /> },
          { path: "/supervisor/dashboard", element: <DashboardScreen /> },
          {
            path: "/supervisor/trabajadores",
            element: <TrabajadoresCrudScreen />,
          },
          { path: "/supervisor/asistencia", element: <AsistenciaScreen /> },
          { path: "/supervisor/traslados", element: <TrasladosScreen /> },
          {
            path: "/supervisor/configuracion",
            element: <SupervisorConfiguracionScreen />,
          },
          {
            path: "/supervisor/trabajadores/nuevo",
            element: <Navigate to="/supervisor/trabajadores" replace />,
          },
          { path: "/captura/fecha", element: <SeleccionFechaScreen /> },
          {
            path: "/captura/labor/:tipoLaborId/trabajadores",
            element: <TrabajadoresScreen />,
          },
          {
            path: "/captura/labor/:tipoLaborId/trabajadores/:trabajadorId",
            element: <CapturaRegistroScreen />,
          },
        ],
      },
      {
        element: <RouteGuard soloAdmin />,
        children: [
          { path: "/admin", element: <AdminDashboardScreen /> },
          { path: "/admin/dashboard-finca", element: <FincaDashboardScreen /> },
          { path: "/admin/fincas", element: <FincasCrudScreen /> },
          { path: "/admin/supervisores", element: <SupervisoresCrudScreen /> },
          {
            path: "/admin/trabajadores",
            element: <TrabajadoresPorFincaScreen />,
          },
          { path: "/admin/planilla", element: <PlanillaScreen /> },
          { path: "/admin/asistencia", element: <AsistenciaPorFincaScreen /> },
          { path: "/admin/traslados", element: <TrasladosAdminScreen /> },
          {
            path: "/admin/configuracion",
            element: <AdminConfiguracionScreen />,
          },
        ],
      },
      { path: "*", element: <NotFoundScreen /> },
    ],
  },
]);
