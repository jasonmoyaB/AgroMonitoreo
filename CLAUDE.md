# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Can't find where something lives? Check `MAPA.md` first — quick path index, kept updated each task.

**Code discovery: use `codebase-memory` MCP first, not Grep/Glob.** Any task needing to find a file, locate a symbol, trace where something lives, or map routes/imports -> use `search_graph`, `trace_path`, `get_code_snippet`, `get_architecture`, or `query_graph` (project not indexed yet -> `index_repository` first). Cheaper than raw grep across the repo. Fall back to Grep/Glob only for plain-text search, configs, or non-code files.

## What this is

PWA (React + TypeScript) to replace an Excel-based daily labor log for the farm **Birrisito** (Chile). A capataz (foreman) logs hours and quantity produced per worker per labor type each day; the app computes productivity (quantity/hours) that used to be calculated by hand in `docs/mano de obra.xlsx`.

**Critical UX constraint**: the primary users are agricultural workers/foremen, many with low literacy. The capture flow must stay icon-first with near-zero free text, large touch targets (≥88px), and numeric input only via +/- steppers — never a keyboard/number pad. Keep this in mind for any UI change in `features/captura`.

## Roles

Two roles, one-way data flow:

- **supervisor** (= "capataz" in the current code, e.g. `REGISTRADO_POR_LOCAL`) — logs all worker/labor/hours/quantity data in the field, and now also manages workers (`features/trabajadores`), tracks daily absences (`features/asistencia`), and views KPIs (`features/supervisor`). This is the only role with app-side screens built so far.
- **admin/oficina** — built: `features/admin` (dashboard, fincas CRUD, supervisores CRUD, trabajadores/asistencia por finca, configuración), routes under `/admin/*` behind `AdminGuard`. Signup still always creates `supervisor` (see `crear_usuario_desde_auth()` below) — an `admin_oficina` user is promoted/created via the admin's own supervisores management (`20260714171722_permitir_gestion_admin_oficina_usuario.sql`), not via `/registro`.

Flow: supervisor logs everything for the day → once logged, it reaches admin/oficina. No reverse flow (admin/oficina doesn't log field data).

### Backend (Supabase — live)

Backend is real, not a plan anymore: Supabase (Postgres + Auth + RLS + Storage), migrations in `supabase/migrations/`. `finca_id` (not a multi-tenant `organizacion_id`) is the data-isolation axis, since this is one admin managing multiple farms they own, not a multi-org SaaS.

- **Tables**: `roles` (seed: `admin_oficina`, `supervisor`), `fincas` (seed: `birrisito`), `trabajadores`, `labores` (the 11 labor types, now DB rows not just a frontend constant — see below), `usuario` (1:1 with `auth.users` via `auth_user_id`, holds `rol_id` + `finca_id`), `asistencia` (per-worker, per-day absence flag, migration `20260709224049_crear_tabla_asistencia.sql`; backs `features/asistencia`).
- **Signup → `usuario` row**: `crear_usuario_desde_auth()` trigger (`AFTER INSERT ON auth.users`, `SECURITY DEFINER`) creates the `usuario` row. It used to read `rol`/`finca_id` from `raw_user_meta_data` (client-supplied signup payload); migration `20260708183000_no_confiar_rol_metadata_signup.sql` removed that — every signup is now hardcoded to `supervisor` + `birrisito` regardless of what the client sends, since trusting client metadata for role assignment is a privilege-escalation hole (anyone could've signed up requesting `admin_oficina`).
- **RLS pattern**: `trabajadores` policies don't check `auth.uid()` directly — they join through `usuario` (`usuario.auth_user_id = auth.uid() and usuario.finca_id = trabajadores.finca_id and usuario.activo = true`). Any new table scoped by farm should follow this same join-through-`usuario` shape, not a bare `finca_id` column check.
- **Storage**: `trabajador-fotos` bucket (public, 5MB limit, jpeg/png/webp only) for worker photos. Insert/update/delete scoped to the caller's `finca_id` via the same `usuario` join, using `storage.foldername(name)[1]` as the farm segment of the object path.
- **Client**: `shared/lib/supabase-client.ts`, single `createClient` instance. Env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (not committed).
- **Supabase Advisors hardening** (`20260709165003`–`20260709165114`): dropped the broad public SELECT policy on `storage.objects` for `trabajador-fotos` (public bucket serves photos via direct URL, which bypasses RLS entirely — the SELECT policy only gated `.list()`/`.download()`, which the app never calls) and revoked EXECUTE on `crear_usuario_desde_auth()`/`rls_auto_enable()` (a Supabase-managed event-trigger helper, not one of ours) from `anon`/`authenticated`/`PUBLIC`. Gotcha hit while doing this: revoking from `anon`+`authenticated` alone isn't enough — Postgres grants EXECUTE to `PUBLIC` by default at function creation, and every role implicitly inherits that, so the advisor kept flagging it until `PUBLIC` was revoked too. Second gotcha: the signup trigger on `auth.users` fires as role `supabase_auth_admin`, which is not a member of `postgres`/`service_role` — revoking from `PUBLIC` broke its ability to fire until an explicit `grant execute ... to supabase_auth_admin` was added back. Verified end-to-end with a disposable signup against the live Auth API (row landed in `usuario` with `rol=supervisor`, `finca_id=birrisito`; user deleted after). Only remaining advisor: **leaked-password protection is disabled** — that one's a Dashboard → Auth → Policies toggle, not something a migration can flip.

### Local dev ≠ remote unless you grant explicitly (`20260709171000`)

`registros_trabajo` (the daily hours/quantity table) is now also on Supabase, not IndexedDB — `features/captura/services/registros-service.ts` and the supervisor KPI dashboard both read/write it for real.

Found while first exercising that table through the real REST API (not just `tsc`): `permission denied for table trabajadores` for an authenticated user, despite a correct RLS policy. Root cause was **not RLS** — it was a missing table-level `GRANT`. The hosted Supabase project already had broad `SELECT/INSERT/UPDATE/DELETE` grants to `anon`/`authenticated` on every table (a platform default set at project creation, invisible in our migration history), but `supabase db reset` locally runs the opposite: an explicit `revoke ... from anon, authenticated, service_role` as part of the CLI's own secure-by-default init. So every table we'd created relied on an implicit grant that only exists on the remote project — local dev looked fine (schema applied) but every real query as `authenticated` would 403. **Rule going forward: every migration that creates a table must include its own `grant select, insert, update, delete on table public.x to authenticated;`** — don't rely on the hosted default, since it doesn't reproduce locally and won't reproduce on a fresh project either. (Granted to `authenticated` only, not `anon` — no policy in this schema gives `anon` anything, so an `anon` grant would be privilege without purpose.)

## Commands

Package manager is **pnpm only** — do not use npm or yarn.

```bash
pnpm install          # install deps
pnpm dev              # start dev server (Vite)
pnpm build            # tsc -b (typecheck) && vite build — must pass before considering work done
pnpm exec tsc -b --noEmit   # typecheck only, no build output — fast check while iterating on types, still run pnpm build before calling work done
pnpm exec vitest run  # run all tests once
pnpm lint             # oxlint
pnpm preview          # serve the production build locally
```

**`pnpm dlx react-doctor --verbose` gate: must show 100%.** Below 100% -> keep fixing + rescanning, loop till 100%. Real bug -> fix code. False positive -> verify by reading actual code/bundle behind finding (don't assume), then add entry to `.react-doctor/false-positives.md` with reasoning, rescan.

Tests (vitest) live under root `/test`, mirroring `src/` paths — not colocated (e.g. `src/features/x/utils/foo.ts` → `test/features/x/utils/foo.test.ts`). Only worth writing for utils with real branching logic (validation, calculations); skip trivial one-liners.

## Architecture

### Layering (enforced, see `.claude/skills/senior-dev/SKILL.md`)

```
components/  → UI only, no fetching, no business logic
hooks/       → state + effects + data fetching (TanStack Query), no JSX
services/    → data access, currently backed by IndexedDB, no UI/state
utils/       → pure functions, no framework imports
types/       → interfaces only
constants/   → fixed/seed values only
stores/      → Zustand global state, no UI
```

Dependency direction is one-way: `components → hooks → services → utils`, and `components → stores/types/constants`. A component in one feature never imports another feature's component directly.

**Cross-feature reality check**: the graph-verified import edges show more cross-feature coupling than a single sanctioned case. In practice: (1) `captura/utils/fecha-iso.ts` and `captura/utils/obtener-dias-en-mes.ts` are the two most-reused utils in the whole codebase (fan-in 7-8) — `supervisor` and `asistencia` both import them directly for date math; they're pure functions with zero framework/feature coupling, so this is tolerated, but they're prime candidates to move to `shared/utils/` next time either is touched. (2) `supervisor/hooks/use-dashboard-kpis.ts` and `use-trabajador-metricas.ts` import `captura/hooks/use-todos-registros.ts` and `use-trabajadores-por-finca.ts` — KPIs are computed over capture data, so supervisor reaching into captura's hooks is expected. (3) `captura/screens/TrabajadoresScreen.tsx` imports `asistencia/hooks/use-ausentes-del-dia.ts` (to hide/flag absent workers in the capture grid), and two `supervisor/components/*` (`AusenciaCalendarioForm`, `CalendarioAusentesPanel`) import utils from both `asistencia` and `captura` directly. None of these cross a *component* boundary (only hooks/utils), so the hard rule above still holds — but treat "one sanctioned cross-feature import" as inaccurate; the real rule is "components never cross features, hooks/utils sometimes do when the data genuinely originates in another feature."

Hard limits carried over from the same skill file (still binding for any new code here): ~150 lines/file, ~30 lines/function, ≤3 function params (use an object beyond that), ≤5 component props, no `any` (use `unknown` + narrowing), no magic numbers/strings without a named constant.

### Structure

- `src/app/router.tsx` — React Router data router, only route wiring. `/login` and `/registro` are public; `/supervisor`, `/supervisor/dashboard`, `/supervisor/trabajadores`, `/supervisor/asistencia`, `/captura/*` sit behind `AuthGuard`; `/admin/*` (dashboard, fincas, supervisores, trabajadores, asistencia, configuración) sits behind `AdminGuard`.
- `src/features/auth/` — login/register screens, `AuthGuard` (redirects to `/login` if there's no Supabase session), `use-auth-session.ts` (wraps `supabase.auth.getSession` + `onAuthStateChange`), `auth-service.ts` (`iniciarSesion`/`registrarSupervisor`/`cerrarSesion`, thin wrappers over `supabase.auth`).
- `src/features/trabajadores/` — worker CRUD against Supabase (`trabajadores-service.ts`): list/create/update/toggle-active, plus photo upload to the `trabajador-fotos` bucket with client-side validation (`validar-foto-trabajador.ts` checks MIME + magic bytes, not just the file extension) before it ever hits Storage. Screen lives in `features/supervisor/screens/TrabajadoresCrudScreen.tsx` — the feature itself is headless (services/hooks/utils only), the CRUD screen composes it into the supervisor app shell.
- `src/features/captura/` — the foreman-facing capture flow (screens → components → hooks → services → utils → types → constants). `features/captura/services/trabajadores-service.ts` re-exports `listarTrabajadoresPorFinca` from `features/trabajadores/services/trabajadores-service.ts` (capture needs to read workers, but worker CRUD belongs to `trabajadores`); don't duplicate that query. `TrabajadoresScreen.tsx` also imports `asistencia/hooks/use-ausentes-del-dia.ts` directly to flag absent workers in the capture grid — see the cross-feature note under Layering. Don't extend either into a components-importing-components pattern.
- `src/features/asistencia/` — daily absence tracking (mark a worker absent/present, weekly attendance table, monthly absence calendar, PDF export of absences). Headless feature (services/hooks/utils/types/constants only, no screens) hosted by `features/supervisor/screens/AsistenciaScreen.tsx`, same composition pattern as `TrabajadoresCrudScreen`. Backed by the `asistencia` table (see Backend). Reuses `captura/utils/fecha-iso.ts` and `obtener-dias-en-mes.ts` for date math instead of duplicating it.
- `src/features/supervisor/` — the supervisor's app shell: `SupervisorDashboardScreen` (labor-type task list, entry point after login), `DashboardScreen` (monthly KPIs/ranking/trend charts), `TrabajadoresCrudScreen` (hosts the `trabajadores` feature's form/table), `AsistenciaScreen` (hosts the `asistencia` feature: weekly table, absence calendar, PDF export). KPI calculations (`calcular-kpis-mensuales.ts`, `calcular-tendencia-diaria.ts`) currently run over `RegistroTrabajo[]` read from IndexedDB (see persistence section below) — they are not yet reading from Supabase.
- `src/features/admin/` — admin/oficina app shell (`AdminGuard`-gated): `AdminDashboardScreen` (rollup KPIs across fincas), `FincasCrudScreen`, `SupervisoresCrudScreen` (manage supervisor/admin users, `services/supervisores-service.ts`), `TrabajadoresPorFincaScreen`, `AsistenciaPorFincaScreen`, `AdminConfiguracionScreen`. Reads across every `finca_id` rather than being scoped to one, per the multi-farm RLS from `20260714165119_permitir_lectura_multi_finca_admin_oficina.sql`.
- `src/shared/` — cross-feature primitives: `components/` (IconTile, Avatar, NumericStepper, StepperButton, LaborIcon), `stores/captura-session-store.ts` (Zustand: current labor type + date), `lib/` (`supabase-client.ts`, `local-db.ts` idb-keyval wrapper, `play-sound.ts`, `vibrate.ts`), `types/domain.types.ts` (Finca, TipoLabor, Trabajador, RegistroTrabajo), `constants/` (the one farm; the 11 labor types are now also DB rows in `labores` but the frontend constant hasn't been replaced by a fetch yet).

### Capture flow

Route chain: labor type is picked from the supervisor dashboard task list (`/supervisor`) → `/captura/labor/:tipoLaborId/trabajadores` (worker grid, photo/initials, green check if already logged today) → `/captura/labor/:tipoLaborId/trabajadores/:trabajadorId` (hours + quantity steppers → confirm). Farm selection is skipped because only Birrisito exists (`shared/constants/finca.constants.ts`), but `Finca` is modeled as a real entity so an admin can add more later.

### Data / persistence today

Everything that matters is on Supabase now: auth (`auth.users` + `usuario`), `trabajadores`, `fincas`, `labores`, `roles`, and `registros_trabajo` (the hours/quantity punches — the core daily-log data this app exists to replace) are all real Postgres tables with RLS, reached through `features/auth`, `features/trabajadores`, and `features/captura/services/registros-service.ts`. `registrado_por` on `registros_trabajo` defaults via `public.usuario_actual_id()` (a `stable` SQL function resolving `auth.uid()` → `usuario.id`), so the client never has to pass it. Verified end-to-end against the real REST API (insert, default fill-in, read-back), not just typechecked.

The one thing still IndexedDB-only is the **in-progress draft** (`use-registro-draft.ts`, 300ms debounce) — that's intentional, it's a resilience layer for a half-filled form, not the source of truth. Resilience against a dropped connection (not full offline-first, since wifi is normally available in the field) is three-layered: that local draft autosave, an optimistic mutation with retry (`use-crear-registro.ts`, TanStack Query `retry: 3`), and the PWA service worker (`vite-plugin-pwa`, `registerType: 'autoUpdate'`).

`shared/lib/supabase-client.ts` is typed with the generated `Database` type (`shared/types/supabase.types.ts`, regenerate via `supabase gen types typescript`) — every `.from('table')` call is now column-checked at compile time.

### The 11 labor types

Seeded in `shared/constants/tipos-labor.constants.ts` from the sheet names in `docs/mano de obra.xlsx`: `cosecha`, `amarre_1`–`amarre_4`, `deshija`, `deshoja`, `despunte`, `palea`, `deshierba`, `emplasticado`. Each has an icon, a distinct color, and a unit of measure (`cajas`/`tramos`/etc.) driving whether/how the quantity stepper renders. If new labor types are added today, they go here — nothing about them is hardcoded into the capture screens. Note this now duplicates the seeded `public.labores` table (migration `20260708172256_crear_tabla_labores.sql`); the frontend constant hasn't been switched over to fetching from Supabase yet, so the two need to be kept in sync by hand until that migration happens.

### Styling

Tailwind CSS v4, CSS-first config — there is no `tailwind.config.js`; the only setup is `@import 'tailwindcss'` in `src/index.css` plus the `@tailwindcss/vite` plugin in `vite.config.ts`.

## Bundled skills that do NOT apply to this repo

This machine's global `.claude/skills/` (and `.agents/skills/`) include `agrotrace-rules` and `search-first`, which document conventions for a **different, unrelated project** called "AgroTrace" — a multi-tenant SaaS with an `organizacion_id`-per-table isolation model and an `apps/web/src/...` monorepo layout. None of that applies here: this repo is a flat single-app Vite project, single-admin/multi-farm (not multi-org), and its isolation axis (once the backend exists) is `finca_id`. Do not import the `organizacion_id` RLS pattern or look for `apps/web` paths in this codebase.
