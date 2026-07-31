# CLAUDE.md

Guidance for Claude Code in this repo. Paths: see `MAPA.md`.

**Code discovery: `codebase-memory` MCP first, not Grep/Glob.** `search_graph`, `trace_path`, `get_code_snippet`, `get_architecture`, `query_graph` (not indexed -> `index_repository`). Grep/Glob only for plain text, configs, non-code.

## Contexto del proyecto

- Arquitectura → @docs/contexto/arquitectura.md
- Convenciones → @docs/contexto/convenciones.md
- Decisiones → @docs/contexto/decisiones.md
- Glosario → @docs/contexto/glosario.md
- Flujo de trabajo → @docs/contexto/flujo-de-trabajo.md
- Errores conocidos → @docs/contexto/errores-conocidos.md

## What this is

PWA (React + TS) replacing an Excel daily labor log (`docs/mano de obra.xlsx`) for finca **Birrisito**. A capataz logs hours + quantity per worker per labor each day; the app computes productivity (quantity/hours).

**Hard UX constraint**: field users have low literacy. `features/captura` stays icon-first, near-zero free text, touch targets ≥88px, numbers only via +/- steppers — never a keyboard/number pad.

## Roles

One-way flow: supervisor logs field data → admin/oficina reads it. No reverse flow.

- **supervisor** ("capataz") — capture, workers, asistencia, traslados, own profile, KPIs.
- **admin/oficina** — `/admin/*` behind `AdminGuard`: rollup + per-finca dashboards, fincas CRUD, supervisores CRUD, trabajadores/asistencia por finca, salarios, traslados, configuración. Reads across every `finca_id` (`20260714165119`).

Signup always creates `supervisor` + `birrisito`, server-side — an `admin_oficina` is promoted from the admin's supervisores screen (`20260714171722`), never via `/registro`.

## Backend (Supabase — live)

Postgres + Auth + RLS + Storage, migrations in `supabase/migrations/`. Isolation axis is **`finca_id`**, not a multi-tenant `organizacion_id` — one admin owning several farms.

**Tables**: `roles`, `fincas` (+ `valor_hora`, `valor_hora_usd`), `trabajadores`, `salarios_trabajadores` (1:1 with `trabajadores`; `salario_mensual`, `moneda` in `usd|colones`), `labores`, `usuario` (1:1 with `auth.users` via `auth_user_id`; holds `rol_id`, `finca_id`, `nombre`), `registros_trabajo`, `asistencia`, `traslados_trabajadores`, `pagos_quincenales`.

- **`registros_trabajo`**: `registrado_por` defaults via `public.usuario_actual_id()` (`auth.uid()` → `usuario.id`), so the client never passes it.
- **`traslados_trabajadores`** (`20260724173240`): one-day loan of a worker between fincas, `estado` = `pendiente|aprobado|rechazado`. No "return" action — it expires by date scoping. Partial unique index blocks a second live row per worker+date; `resolver_traslado_trabajador()` stamps `resuelto_por`/`resuelto_en`, rejects any update to an already-resolved row, and pins `trabajador_id`/`fecha`/both `finca_*` to their original values so approving can only move `estado`; check constraint rejects origen = destino.
- **`pagos_quincenales`** (`20260729163414`): one row per worker per quincena. `monto`/`moneda`/`monto_bruto`/`dias_ausentes` are a **snapshot** — raising a salary, changing `valor_hora` or deleting an absence later never rewrites what was already paid, and the liquidación PDF can still explain the net it printed (`20260731185135`). Admin-only, cross-finca, and deliberately no UPDATE/DELETE policy: a paid quincena is corrected with a new adjustment, not by editing the past. Same migration adds `tocar_actualizado_en()`, which stamps `salarios_trabajadores.actualizado_en` server-side (the client used to send it).
- **Signup trigger**: `crear_usuario_desde_auth()` (`AFTER INSERT ON auth.users`, `SECURITY DEFINER`). Role/finca are hardcoded, never read from `raw_user_meta_data` (`20260708183000`) — trusting client metadata was a privilege-escalation hole.
- **Storage**: `trabajador-fotos` bucket (public, 5MB, jpeg/png/webp). Writes scoped by `storage.foldername(name)[1]` = finca.
- **Client**: `shared/lib/supabase-client.ts`, single `createClient<Database>`. `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (uncommitted).

### Two rules learned the hard way

1. **RLS joins through `usuario`**, never a bare column check:
   `usuario.auth_user_id = auth.uid() and usuario.finca_id = <tabla>.finca_id and usuario.activo = true`. Follow this shape for every farm-scoped table.
2. **Every migration creating a table must also `grant select, insert, update, delete on table public.x to authenticated;`** — the hosted project grants this by invisible platform default, but `supabase db reset` revokes it locally, so a missing grant 403s in local dev while `tsc` and the schema look fine. Grant to `authenticated` only; no policy here gives `anon` anything.

Related gotchas, if you touch `SECURITY DEFINER` functions: Postgres grants EXECUTE to `PUBLIC` at creation, so revoking from `anon`+`authenticated` alone leaves the advisor flagging it; and the signup trigger runs as `supabase_auth_admin`, which needs its grant added back explicitly. Only open advisor: leaked-password protection (Dashboard toggle, no migration can flip it).

## Commands

**pnpm only** — no npm/yarn.

```bash
pnpm dev              # dev server
pnpm build            # tsc -b && vite build — must pass before work is done
pnpm exec tsc -b --noEmit   # fast typecheck while iterating
pnpm exec vitest run  # tests
pnpm lint             # oxlint
pnpm db:types         # regenerate src/shared/types/supabase.types.ts after any migration
```

**`pnpm dlx react-doctor --verbose` must show 100%.** Below that -> fix + rescan, loop. Real bug -> fix code. False positive -> verify against actual code/bundle (don't assume), then log it in `.react-doctor/false-positives.md` and rescan.

Tests live in root `/test`, mirroring `src/` (`src/features/x/utils/foo.ts` → `test/features/x/utils/foo.test.ts`), not colocated. Write them for utils with real branching (validation, calculations); skip one-liners.

## Architecture

```
components/  → UI only, no fetching, no business logic
hooks/       → state + effects + TanStack Query, no JSX
services/    → data access (Supabase), no UI/state
utils/       → pure functions, no framework imports
types/ constants/ stores/  → interfaces / fixed values / Zustand
```

One-way: `components → hooks → services → utils`, plus `components → stores/types/constants`.

**Cross-feature rule**: components never import another feature's components. Hooks/utils may, when the data genuinely originates there — e.g. `supervisor` KPI hooks read `captura/hooks/use-todos-registros.ts`; `captura/screens/TrabajadoresScreen.tsx` reads `asistencia` and `traslados` hooks to flag absent/loaned workers. `captura/services/trabajadores-service.ts` re-exports from `features/trabajadores` — don't duplicate that query. `captura/utils/obtener-dias-en-mes.ts` is read by `planilla` from outside the feature; `fecha-iso.ts` already moved to `shared/utils/` — move this one too next time it's touched.

Hard limits: ~150 lines/file, ~30 lines/function, ≤3 function params (object beyond that), ≤5 component props, no `any` (use `unknown` + narrowing), no unnamed magic numbers/strings.

### Features

- `app/router.tsx` — routes only. Public: `/login`, `/registro`, `/olvide-password`, `/reset-password`. `AuthGuard`: `/supervisor/*`, `/captura/*`. `AdminGuard`: `/admin/*`.
- `features/auth` — login/registro/recuperación, `AuthGuard`, session hook, login cooldown.
- `features/captura` — the foreman flow. `/supervisor` (labor list) → `/captura/labor/:tipoLaborId/trabajadores` (grid, green check if already logged today) → `.../:trabajadorId` (hours + quantity steppers → confirm).
- `features/trabajadores` — headless: worker CRUD + photo upload (`validar-foto-trabajador.ts` checks MIME **and** magic bytes), per-worker metrics modal.
- `features/asistencia` — headless: daily absence, weekly table, monthly calendar, PDF export.
- `features/traslados` — request/approve one-day worker loans between fincas; badges on both origin and destination sides.
- `features/perfil` — headless: edit own name, change password.
- `features/planilla` — headless: quincena range (1–15 / 16–end), rows crossing current salary with the already-registered payment, register payment, liquidación PDF. Hosted by `admin/screens/PlanillaScreen.tsx` at `/admin/planilla`.
- `features/supervisor` — supervisor shell; hosts the headless features above. KPIs read `registros_trabajo` from Supabase.
- `features/admin` — admin shell (see Roles).
- `shared/` — `components/` (IconTile, Avatar, NumericStepper, Modal, Toast, charts, KPI cards), `stores/` (captura session, toasts), `lib/` (supabase client, `local-db.ts`, `pdf-doc.ts`, sound/vibrate), `utils/kpis/`, `utils/pdf/`, `types/domain.types.ts`.

### Payroll (`/admin/salarios`, `/admin/planilla`)

Admin types a fixed **monthly** salary per worker; the quincena's **gross** is simply half, rounded per currency (colones to the unit, usd to 2 decimals — `shared/utils/redondear-por-moneda.ts`, shared with the absence deduction so gross − deduction always closes). Not computed from hours or production.

**Absences are deducted** (`20260731185134`/`20260731185135`): one absent day costs `valor_hora × JORNADA_NORMAL_HORAS` (8). Every `asistencia` row in the quincena's date range counts — all three types (`vacaciones`, `permisos`, `permisos_medicos`), by explicit user decision, despite vacations being paid leave under CR law. Net is clamped at 0. `fincas` now carries **two** hourly rates, `valor_hora` (colones) and `valor_hora_usd`; the one matching the worker's `moneda` is used, and `0` means "undefined" → deduct nothing rather than deduct wrong. Deduction runs in `planilla/utils/calcular-deduccion-ausencias.ts`, applied in `construir-filas-planilla.ts`.

Paying is a separate step: `/admin/planilla` writes a row to `pagos_quincenales` whose `monto`/`moneda` are frozen at that moment. So the table shows what was actually paid when a payment exists, and only falls back to today's computed half when it doesn't — raising a salary never rewrites a past quincena (`planilla/utils/construir-filas-planilla.ts`). Cut is calendar 1–15 / 16–end of month, 24 payments a year.

Salary lives in its own table `salarios_trabajadores`, **not** as columns on `trabajadores`, and this is load-bearing: RLS is row-level, so any policy on `trabajadores` exposes every column of the rows it reaches. `trabajadores_select_activos_multi_finca` deliberately opens the whole table (traslados needs to list other fincas' workers) and `trabajadores_update_own_finca` lets a supervisor write his own finca's rows. While salary sat on `trabajadores`, both applied to it. Never move it back, and never add another sensitive column there.

### Persistence

Everything real is Supabase. The **only** IndexedDB thing left is the in-progress capture draft (`use-registro-draft.ts`, 300ms debounce) — a resilience layer for a half-filled form, not a source of truth. Dropped-connection resilience is three layers: that draft, optimistic mutation with `retry: 3`, and the PWA service worker (`vite-plugin-pwa`, `autoUpdate`). Not offline-first; wifi is normally available.

### The 11 labor types

`shared/constants/tipos-labor.constants.ts`: `cosecha`, `amarre_1`–`amarre_4`, `deshija`, `deshoja`, `despunte`, `palea`, `deshierba`, `emplasticado`. Each carries icon, color, unit (`cajas`/`tramos`/…) driving the quantity stepper. This duplicates the seeded `public.labores` table — the frontend still doesn't fetch it, so **keep both in sync by hand**.

### Styling

Tailwind v4, CSS-first: no `tailwind.config.js`, just `@import 'tailwindcss'` in `src/index.css` + `@tailwindcss/vite`. Preserve the neumorphic tokens (`neu-raised`, `neu-pressed`) unless deliberately redesigning.

## Skills that do NOT apply here

Global `agrotrace-rules` and `search-first` document **AgroTrace**, a different project: multi-tenant `organizacion_id`, `apps/web/...` monorepo. This repo is a flat single-app Vite project isolated by `finca_id`. Ignore both.
