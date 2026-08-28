# Arquitectura

## Stack

PWA React + TypeScript, **una sola app Vite** (no monorepo). Entrada: `src/main.tsx` → `src/App.tsx` → `src/app/router.tsx`.

| Qué | Con qué |
|---|---|
| UI | React 19, Tailwind v4 (CSS-first, sin `tailwind.config.js`), `lucide-react` |
| Rutas | `react-router-dom` 7 (`createBrowserRouter`) |
| Estado servidor | TanStack Query 5 |
| Estado cliente | Zustand 5 (`shared/stores/`) |
| Backend | Supabase (`@supabase/supabase-js` 2) |
| Local | `idb-keyval` (solo el draft de captura) |
| PWA | `vite-plugin-pwa`, `registerType: 'autoUpdate'` |
| Tests / lint | vitest 3, oxlint |

Package manager: **pnpm** (`pnpm@10.33.2`). Nunca npm/yarn.

## Capas

```
components/  → solo UI, sin fetching ni lógica de negocio
hooks/       → estado + efectos + TanStack Query, sin JSX
services/    → acceso a datos (Supabase), sin UI ni estado
utils/       → funciones puras, sin imports de framework
types/ constants/ stores/  → interfaces / valores fijos / Zustand
```

Dirección única: `components → hooks → services → utils`, más `components → stores/types/constants`.

Los componentes nunca importan componentes de otra feature. Hooks y utils sí pueden, cuando el dato nace ahí (ej. los KPIs de `supervisor` leen `captura/hooks/use-registros-del-mes.ts`).

## Features (`src/features/`)

| Feature | Qué es |
|---|---|
| `auth` | login / recuperación / alta por invitación, `RouteGuard` (uno solo, con prop `soloAdmin`), cooldown de login |
| `captura` | el flujo del capataz en campo (labor → trabajador → horas/cantidad) |
| `trabajadores` | headless: CRUD + foto, modal de métricas por trabajador |
| `asistencia` | headless: ausencia diaria, tabla semanal, calendario mensual, PDF |
| `traslados` | préstamo de un trabajador a otra finca por un día |
| `perfil` | headless: editar nombre propio, cambiar contraseña, datos personales propios (columnas de `usuario`) |
| `planilla` | headless: quincena, pago quincenal, PDF de liquidación |
| `supervisor` | shell del supervisor; hospeda las features headless + KPIs |
| `admin` | shell de oficina; hospeda `planilla` (con los salarios editables adentro), dashboards, CRUDs |

`shared/` tiene componentes comunes (`LaborIcon`, `Avatar`, `NumericStepper`, `StepperButton`, `Modal`, `Toast`, charts, KPI cards, `DashboardPorUnidad`), `lib/` (cliente Supabase, `pdf-doc.ts` / `pdf-texto.ts`, sonido/vibración, `descargar-blob.ts`), `hooks/` (`use-network-status.ts`, `use-descargar-dashboard-pdf.ts`, `use-contribuyente-hacienda.ts`), `services/hacienda-service.ts`, `constants/` (`tipos-labor`, `meses`, `finca`, `hacienda`, `toast`, `botones`, `campos`), `utils/kpis/`, `utils/pdf/` y `types/domain.types.ts` + `types/kpis.types.ts`.

La regla que ordena qué sube a `shared/` es de una sola dirección: **`shared/` nunca importa de `features/`**. Por eso `meses.constants.ts` dejó de vivir en `captura/constants/` — lo leen `admin`, `asistencia` y los títulos de los gráficos — igual que antes lo hicieron `obtener-dias-en-mes.ts` y `fecha-iso.ts`.

No hay `lib/local-db.ts`: el draft de captura importa `idb-keyval` directo.

## Rutas (`src/app/router.tsx`)

- **Públicas**: `/login`, `/olvide-password`, `/reset-password` (esta última también recibe la invitación, con `?invitacion=1`)
- **Sin pantalla propia**: `/` redirige a `/supervisor` y `*` cae en `NotFoundScreen`
- **`RouteGuard`**: `/supervisor`, `/supervisor/{dashboard,trabajadores,trabajadores/nuevo,asistencia,traslados,configuracion}`, `/captura/fecha`, `/captura/labor/:tipoLaborId/trabajadores[/:trabajadorId]`
- **`RouteGuard soloAdmin`**: `/admin`, `/admin/{dashboard-finca,fincas,supervisores,trabajadores,planilla,asistencia,traslados,configuracion}`

Es **un solo componente** (`auth/components/RouteGuard.tsx`) con prop `soloAdmin`; no existen `AuthGuard.tsx` ni `AdminGuard.tsx`. Decide con el util puro `auth/utils/decidir-acceso-ruta.ts`, que devuelve `cargando | a-login | a-admin | a-supervisor | sin-finca | permitido` — las ramas de seguridad viven ahí para poder testearlas.

**No hay `/admin/salarios`**: el salario mensual y la moneda se editan en la propia fila de `/admin/planilla`, y el valor hora de la finca arriba de esa misma tabla.

## Flujo de datos

```
componente → hook (useQuery/useMutation, key desde *-query.constants.ts)
           → service (Supabase; mapea snake_case de la fila → camelCase del dominio)
           → util puro
```

Ejemplo real de punta a punta: `admin/screens/PlanillaScreen.tsx` → `planilla/hooks/use-planilla-quincena.ts` → `planilla/services/planilla-service.ts` → `planilla/utils/construir-filas-planilla.ts` → `shared/utils/calcular-monto-quincena.ts`.

## Backend

Supabase real (Postgres + Auth + RLS + Storage). Migraciones en `supabase/migrations/`. El eje de aislamiento es **`finca_id`**, no un `organizacion_id` multi-tenant: un dueño con varias fincas.

Tablas: `roles`, `fincas`, `trabajadores`, `datos_trabajadores`, `salarios_trabajadores`, `labores`, `usuario`, `registros_trabajo`, `asistencia`, `traslados_trabajadores`, `pagos_quincenales`. Storage: bucket `trabajador-fotos`.

Cliente único: `shared/lib/supabase-client.ts`. Envs: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.local`, no versionado).

## Qué NO existe

- **No es offline-first.** El único IndexedDB es el draft de captura a medias (`captura/hooks/use-registro-draft.ts`) — capa de resiliencia, no fuente de verdad. Normalmente hay wifi.
- **No hay backend propio.** Casi toda la lógica de servidor son policies RLS, triggers y funciones SQL. La única excepción es `supabase/functions/invitar-usuario/`: existe solo porque invitar requiere el `service_role`, que no puede vivir en el front.
- **No hay monorepo.** `pnpm-workspace.yaml` existe pero la app es una sola.
- **No hay `tailwind.config.js`.** Tailwind v4 CSS-first: `@import 'tailwindcss'` en `src/index.css` + `@tailwindcss/vite`.
- **No hay librería de toasts.** Sistema propio en `shared/` (ver `docs/instruccions/3-notificaciones-toast.md`).
- **No hay signup público.** `enable_signup = false`: nadie se registra solo, ni por pantalla ni por `POST /auth/v1/signup`. El admin invita por correo desde `/admin/supervisores`; el invitado entra como `supervisor` **sin finca** (`finca_id` null) y el admin le asigna la finca desde esa misma tabla, donde también se lo promueve a admin (`docs/instruccions/7-crear-usuario-admin.md`).
- **El frontend no lee la tabla `labores`.** Usa `shared/constants/tipos-labor.constants.ts`; las dos se sincronizan a mano.
- **No hay tests de componentes.** Sí hay de utils, services, `lib/`, constants, stores y de un hook (`use-crear-registro-invalidacion`) — lo que falta es JSX renderizado (ver `convenciones.md`).
- **CI mínima**: `.github/workflows/react-doctor.yml` corre React Doctor en PRs y en push a `main`, en modo advisory (nunca falla el check). No hay job de `build`, `lint` ni `vitest` — esos se corren en local.
