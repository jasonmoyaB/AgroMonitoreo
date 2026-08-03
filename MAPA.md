# MAPA.md — dónde está cada cosa

Índice rápido de ubicaciones. Para reglas/convenciones/arquitectura, ver `CLAUDE.md` (fuente de verdad); esto es solo el mapa de "dónde busco X".

| Necesito... | Ruta |
|---|---|
| Rutas de la app | `src/app/router.tsx` |
| Login / registro / guard de auth | `src/features/auth/` |
| Rate limit de login/registro | `src/features/auth/hooks/use-login-cooldown.ts` + `utils/calcular-cooldown-ms.ts` (cooldown UX cliente) — `[auth.rate_limit].sign_in_sign_ups` en `supabase/config.toml` (límite real por IP, server-side vía GoTrue). Bloqueo de cuenta por Auth Hook se intentó y se revirtió: requiere plan Teams/Enterprise, ver `supabase/migrations/20260715160413_revertir_hook_password_verification_no_disponible_free.sql` |
| Flujo de captura (foreman) | `src/features/captura/` (screens → components → hooks → services → utils → types → constants) |
| Dashboard supervisor / KPIs | `src/features/supervisor/` |
| CRUD de trabajadores + fotos | `src/features/trabajadores/` |
| Modal de métricas por trabajador (KPIs, tabla por labor, export PDF) | `src/features/trabajadores/components/TrabajadorMetricasModal.tsx` + `hooks/use-trabajador-metricas-modal.ts` — usado por `supervisor/screens/TrabajadoresCrudScreen.tsx` y `admin/screens/TrabajadoresPorFincaScreen.tsx` |
| App admin (dashboard, fincas, trabajadores/asistencia por finca, supervisores) | `src/features/admin/` (rutas bajo `AdminGuard`, `/admin/*`) |
| Gestión de supervisores (rol, nombre, finca asignada) | `src/features/admin/services/supervisores-service.ts` + `hooks/use-supervisores-crud.ts` + `screens/SupervisoresCrudScreen.tsx` |
| Asistencia / ausencias (calendario, tabla semanal, PDF) | `src/features/asistencia/` (hosteado por `src/features/supervisor/screens/AsistenciaScreen.tsx` y `src/features/admin/screens/AsistenciaPorFincaScreen.tsx`) |
| Traslados de trabajadores entre fincas (solicitar/aprobar préstamo por un día) | `src/features/traslados/` (headless), hosteado por `supervisor/screens/TrasladosScreen.tsx` y `admin/screens/TrasladosAdminScreen.tsx` — `traslados-service.ts` (tabla `traslados_trabajadores`); `listarTrabajadoresPrestadosHoy` (lado destino, badge "De {finca}" en `WorkerCard`) y `listarTrabajadoresTrasladadosHoy` (lado origen: bloquea selección + badge "De traslado en {finca}" en `captura/screens/TrabajadoresScreen.tsx`, y badge "Trabajador trasladado a: {finca}" en `supervisor/screens/TrabajadoresCrudScreen.tsx` / `components/TrabajadoresTable.tsx`) |
| Salarios (salario mensual por trabajador, valor hora por finca) | **Sin pantalla propia**: se editan dentro de `/admin/planilla`. `admin/components/CeldasSalario.tsx` son las celdas editables (salario + moneda) de `PlanillaTable`; `admin/components/ValorHoraFinca.tsx` + `ValorHoraInput.tsx` + `hooks/use-actualizar-valor-hora.ts` editan el valor hora de la finca arriba de la tabla. Datos: `admin/services/salarios-service.ts`, tabla `salarios_trabajadores` (`salario_mensual`, `moneda`) — **no** son columnas de `trabajadores`, se movieron en `20260728100100`. `fincas.valor_hora` (colones) y `valor_hora_usd` fijan el costo del día ausente que descuenta la planilla |
| Planilla / quincena (monto por quincena, registrar pago, PDF de liquidación) | `src/features/planilla/` (headless: `use-planilla-quincena.ts`, `planilla-service.ts`, `obtener-rango-quincena.ts`, `construir-filas-planilla.ts`, `generar-pdf-liquidacion.ts`), hosteado por `admin/screens/PlanillaScreen.tsx` + `components/PlanillaTable.tsx` / `CeldasSalario.tsx` / `ValorHoraFinca.tsx` / `AusenciasQuincenaModal.tsx` / `PeriodoSelector.tsx` (`/admin/planilla`). El salario mensual y la moneda se editan en la propia fila: `usePlanillaQuincena` expone `guardarSalario` e invalida su misma query, así la quincena se recalcula sin navegar. La celda de Ausencias abre el modal con las fechas y el tipo de cada falta. Tabla `pagos_quincenales` (snapshot: monto, moneda, `monto_bruto` y `dias_ausentes` congelados al pagar). Bruto = `shared/utils/calcular-monto-quincena.ts`; columna informativa "Monto semanal" = `shared/utils/calcular-monto-semanal.ts` (mensual / 4, cierra contra la quincena; no se paga ni se registra); descuento por ausencias = `planilla/utils/calcular-deduccion-ausencias.ts` (valor hora × 8), redondeo compartido en `shared/utils/redondear-por-moneda.ts` |
| Perfil propio (editar nombre, cambiar password) | `src/features/perfil/` (hosteado por las pantallas `ConfiguracionScreen` de supervisor y admin) |
| Toasts globales | `src/shared/stores/toast-store.ts` + `components/Toast.tsx` / `ToastViewport.tsx` |
| Generación de PDF (dashboard, ausencias, métricas) | `src/shared/lib/pdf-doc.ts` + `src/shared/utils/pdf/` + `hooks/use-descargar-dashboard-pdf.ts` |
| Estado de red / banner offline | `src/shared/hooks/use-network-status.ts` + `components/OfflineBanner.tsx` |
| Regla de horas extra (umbral 8h, acumulado por día) | `docs/horas-extra.md` — umbral en `src/features/supervisor/constants/trabajador-metricas.constants.ts` |
| Componentes compartidos (IconTile, Avatar, Stepper...) | `src/shared/components/` |
| Cliente Supabase | `src/shared/lib/supabase-client.ts` |
| Tipos generados de Supabase (regenerar tras migración) | `src/shared/types/supabase.types.ts` |
| Draft local (IndexedDB, autosave) | `src/features/captura/hooks/use-registro-draft.ts` |
| Zustand store de sesión de captura | `src/shared/stores/captura-session-store.ts` |
| Las 11 labores (constante frontend) | `src/shared/constants/tipos-labor.constants.ts` |
| Migraciones Supabase | `supabase/migrations/` |
| Schema `private` (helpers `SECURITY DEFINER`, fuera de la API de PostgREST) | creado en `supabase/migrations/20260803232810_mover_es_admin_oficina_a_schema_private.sql` — hoy solo `private.es_admin_oficina()`, usada por las policies de `usuario` y `fincas` |
| Contexto del proyecto (arquitectura, convenciones, decisiones, glosario, flujo, gotchas) | `docs/contexto/` — referenciado desde `CLAUDE.md` y `AGENTS.md` |
| Docs sueltos (seguridad, cambios puntuales) | `docs/` |
| Reglas responsive (shell, sidebar, grids, tablas) | `docs/RESPONSIVE.md` |
| Tests | `test/` (espejo de `src/`, no colocados) |

## Mantenimiento
Al terminar una tarea que agregue una carpeta, feature, tabla o servicio nuevo: agregá una fila acá. No dupliques prosa de `CLAUDE.md` — solo la ruta.
