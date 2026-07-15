# MAPA.md — dónde está cada cosa

Índice rápido de ubicaciones. Para reglas/convenciones/arquitectura, ver `CLAUDE.md` (fuente de verdad); esto es solo el mapa de "dónde busco X".

| Necesito... | Ruta |
|---|---|
| Rutas de la app | `src/app/router.tsx` |
| Login / registro / guard de auth | `src/features/auth/` |
| Flujo de captura (foreman) | `src/features/captura/` (screens → components → hooks → services → utils → types → constants) |
| Dashboard supervisor / KPIs | `src/features/supervisor/` |
| CRUD de trabajadores + fotos | `src/features/trabajadores/` |
| Modal de métricas por trabajador (KPIs, tabla por labor, export PDF) | `src/features/trabajadores/components/TrabajadorMetricasModal.tsx` + `hooks/use-trabajador-metricas-modal.ts` — usado por `supervisor/screens/TrabajadoresCrudScreen.tsx` y `admin/screens/TrabajadoresPorFincaScreen.tsx` |
| App admin (dashboard, fincas, trabajadores/asistencia por finca, supervisores) | `src/features/admin/` (rutas bajo `AdminGuard`, `/admin/*`) |
| Gestión de supervisores (rol, nombre, finca asignada) | `src/features/admin/services/supervisores-service.ts` + `hooks/use-supervisores-crud.ts` + `screens/SupervisoresCrudScreen.tsx` |
| Asistencia / ausencias (calendario, tabla semanal, PDF) | `src/features/asistencia/` (hosteado por `src/features/supervisor/screens/AsistenciaScreen.tsx` y `src/features/admin/screens/AsistenciaPorFincaScreen.tsx`) |
| Componentes compartidos (IconTile, Avatar, Stepper...) | `src/shared/components/` |
| Cliente Supabase | `src/shared/lib/supabase-client.ts` |
| Tipos generados de Supabase (regenerar tras migración) | `src/shared/types/supabase.types.ts` |
| Draft local (IndexedDB, autosave) | `src/features/captura/hooks/use-registro-draft.ts` |
| Zustand store de sesión de captura | `src/shared/stores/captura-session-store.ts` |
| Las 11 labores (constante frontend) | `src/shared/constants/tipos-labor.constants.ts` |
| Migraciones Supabase | `supabase/migrations/` |
| Docs sueltos (seguridad, cambios puntuales) | `docs/` |
| Reglas responsive (shell, sidebar, grids, tablas) | `docs/RESPONSIVE.md` |
| Tests | `test/` (espejo de `src/`, no colocados) |

## Mantenimiento
Al terminar una tarea que agregue una carpeta, feature, tabla o servicio nuevo: agregá una fila acá. No dupliques prosa de `CLAUDE.md` — solo la ruta.
