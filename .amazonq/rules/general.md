# General Rules — AgroMonitoreo (Birrisito)

## Project

PWA React + TypeScript. Replaces Excel labor log for farm Birrisito (Chile). Foreman (capataz) logs hours + quantity per worker per labor type per day. App computes productivity (quantity/hours).

Primary users: agricultural workers/foremen, low literacy. Capture UI (`features/captura`) must stay icon-first, near-zero free text, large touch targets (≥88px), +/- steppers only — never keyboard/number pad.

Package manager: **pnpm only**. Never npm/yarn.

## SOLID

- **SRP**: one reason to change per module. A service does data access. A hook does state/effects. A component does UI. Don't mix.
- **OCP**: extend via new files/constants, not by branching existing logic with new conditionals. New labor type → add to `tipos-labor.constants.ts`, don't add `if` branches in capture screens.
- **LSP**: don't special-case a subtype's behavior in the caller. If a variant needs different handling, it's the wrong abstraction.
- **ISP**: don't force a component to accept props it ignores. Split types/interfaces per consumer need.
- **DIP**: components depend on hooks, hooks depend on services, services depend on Supabase client — never the reverse. High-level code never imports low-level implementation details directly.

## Layering (enforced)

```
components/  → UI only, no fetching, no business logic
hooks/       → state + effects + data fetching (TanStack Query), no JSX
services/    → data access (Supabase), no UI/state
utils/       → pure functions, no framework imports
types/       → interfaces only
constants/   → fixed/seed values only
stores/      → Zustand global state, no UI
```

Dependency direction one-way: `components → hooks → services → utils`, and `components → stores/types/constants`. A component in one feature never imports another feature's component directly. Cross-feature service reuse (e.g. `captura` reading `trabajadores` service) is the only sanctioned exception — don't extend that into components-importing-components.

## Hard limits

- ~150 lines/file
- ~30 lines/function
- ≤3 function params (object beyond that)
- ≤5 component props
- No `any` — use `unknown` + narrowing
- No magic numbers/strings without a named constant

## Backend (Supabase)

- Isolation axis is `finca_id`, not `organizacion_id` (single admin, multiple farms — not multi-tenant SaaS).
- RLS policies join through `usuario` table (`usuario.auth_user_id = auth.uid() and usuario.finca_id = X.finca_id and usuario.activo = true`), never a bare `finca_id` column check.
- Every migration creating a table must include explicit `grant select, insert, update, delete on table public.x to authenticated;` — hosted project has implicit legacy grants that don't reproduce locally or on fresh projects.
- Never trust client-supplied role/metadata for privilege assignment (signup hardcodes `supervisor` + `birrisito` server-side via trigger).
- Client typed against generated `Database` type (`shared/types/supabase.types.ts`) — every `.from('table')` call must be column-checked at compile time. Regenerate after schema changes.

## Before finishing any change

- `pnpm build` (tsc -b + vite build) must pass.
- `pnpm lint` (oxlint) must pass.
- No test runner configured yet — don't invent one unless asked.
- For UI changes in `features/captura`, verify touch targets and stepper-only input are preserved.
