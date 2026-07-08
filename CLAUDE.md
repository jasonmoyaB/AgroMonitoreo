# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PWA (React + TypeScript) to replace an Excel-based daily labor log for the farm **Birrisito** (Chile). A capataz (foreman) logs hours and quantity produced per worker per labor type each day; the app computes productivity (quantity/hours) that used to be calculated by hand in `docs/mano de obra.xlsx`.

**Critical UX constraint**: the primary users are agricultural workers/foremen, many with low literacy. The capture flow must stay icon-first with near-zero free text, large touch targets (≥88px), and numeric input only via +/- steppers — never a keyboard/number pad. Keep this in mind for any UI change in `features/captura`.

## Roles

Two roles, one-way data flow:

- **supervisor** (= "capataz" in the current code, e.g. `REGISTRADO_POR_LOCAL`) — logs all worker/labor/hours/quantity data in the field. This is the only role built so far (`features/captura`).
- **admin/oficina** — receives what the supervisor logged (read/manage side: dashboard, metrics, worker/labor-type/farm management). Not built yet, next phase.

Flow: supervisor logs everything for the day → once logged, it reaches admin/oficina. No reverse flow (admin/oficina doesn't log field data).

Only the frontend is implemented so far, and only the supervisor-facing capture flow at that. There is no backend yet — the plan (not yet built) is Supabase (Postgres + Auth + RLS), with `finca_id` (not a multi-tenant `organizacion_id`) as the data-isolation axis and role-based RLS (`supervisor` vs `admin`), since this is one admin managing multiple farms they own, not a multi-org SaaS.

## Commands

Package manager is **pnpm only** — do not use npm or yarn.

```bash
pnpm install          # install deps
pnpm dev              # start dev server (Vite)
pnpm build            # tsc -b (typecheck) && vite build — must pass before considering work done
pnpm exec tsc -b --noEmit   # typecheck only, no build output
pnpm lint             # oxlint
pnpm preview          # serve the production build locally
```

There is no test runner configured yet.

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

Hard limits carried over from the same skill file (still binding for any new code here): ~150 lines/file, ~30 lines/function, ≤3 function params (use an object beyond that), ≤5 component props, no `any` (use `unknown` + narrowing), no magic numbers/strings without a named constant.

### Structure

- `src/app/router.tsx` — React Router data router, only route wiring.
- `src/features/captura/` — the entire foreman-facing capture flow (screens → components → hooks → services → utils → types → constants), the only feature implemented today.
- `src/shared/` — cross-feature primitives: `components/` (IconTile, Avatar, NumericStepper, StepperButton, LaborIcon), `stores/captura-session-store.ts` (Zustand: current labor type + date), `lib/` (`local-db.ts` idb-keyval wrapper, `play-sound.ts`, `vibrate.ts`), `types/domain.types.ts` (Finca, TipoLabor, Trabajador, RegistroTrabajo), `constants/` (seed data for the one farm and its 11 labor types).

### Capture flow

Route chain: `/captura/labor` (pick labor type, icon grid) → `/captura/labor/:tipoLaborId/trabajadores` (worker grid, photo/initials, green check if already logged today) → `/captura/labor/:tipoLaborId/trabajadores/:trabajadorId` (hours + quantity steppers → confirm). Farm selection is skipped because only Birrisito exists (`shared/constants/finca.constants.ts`), but `Finca` is modeled as a real entity so an admin can add more later.

### Data / persistence today

No backend is wired up. `features/captura/services/*-service.ts` persist to IndexedDB via `shared/lib/local-db.ts` (idb-keyval) using the same async function signatures a future Supabase-backed implementation would use — hooks and components should never need to change when that swap happens (dependency inversion: services are the only layer that knows about the storage mechanism).

Resilience against a dropped connection (not full offline-first, since wifi is normally available in the field) is three-layered: local draft autosave (`use-registro-draft.ts`, 300ms debounce to IndexedDB), an optimistic mutation with retry (`use-crear-registro.ts`, TanStack Query `retry: 3`), and the PWA service worker (`vite-plugin-pwa`, `registerType: 'autoUpdate'`).

### The 11 labor types

Seeded in `shared/constants/tipos-labor.constants.ts` from the sheet names in `docs/mano de obra.xlsx`: `cosecha`, `amarre_1`–`amarre_4`, `deshija`, `deshoja`, `despunte`, `palea`, `deshierba`, `emplasticado`. Each has an icon, a distinct color, and a unit of measure (`cajas`/`tramos`/etc.) driving whether/how the quantity stepper renders. If new labor types are added, they go here — nothing about them is hardcoded into the capture screens.

### Styling

Tailwind CSS v4, CSS-first config — there is no `tailwind.config.js`; the only setup is `@import 'tailwindcss'` in `src/index.css` plus the `@tailwindcss/vite` plugin in `vite.config.ts`.

## Bundled skills that do NOT apply to this repo

This machine's global `.claude/skills/` (and `.agents/skills/`) include `agrotrace-rules` and `search-first`, which document conventions for a **different, unrelated project** called "AgroTrace" — a multi-tenant SaaS with an `organizacion_id`-per-table isolation model and an `apps/web/src/...` monorepo layout. None of that applies here: this repo is a flat single-app Vite project, single-admin/multi-farm (not multi-org), and its isolation axis (once the backend exists) is `finca_id`. Do not import the `organizacion_id` RLS pattern or look for `apps/web` paths in this codebase.
