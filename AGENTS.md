# AGENTS.md

## Project Shape
- This is a single Vite React/TypeScript PWA, not a monorepo. The useful project docs are `CLAUDE.md` and `docs/instruccions/*.md`; `README.md` is still the Vite template.
- The app replaces `docs/mano de obra.xlsx` for Finca Birrisito labor capture. UI built so far: supervisor/capataz capture flow, worker CRUD (`features/trabajadores`), login/register (`features/auth`), supervisor KPI dashboard. admin/oficina role is not built yet (seeded in DB, no UI/signup path assigns it).
- Backend is live: Supabase (Postgres + Auth + RLS + Storage), migrations in `supabase/migrations/`. `roles`, `fincas`, `trabajadores`, `labores`, `usuario`, `registros_trabajo` are all real tables — nothing capture-related is IndexedDB-backed anymore except the in-progress draft autosave.

## Commands
- Use pnpm only: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm preview`.
- Definition of done is `pnpm build` then `pnpm lint`; there is no separate test runner today.
- Typecheck-only shortcut: `pnpm exec tsc -b --noEmit`.
- Supabase local type generation: `pnpm db:types` writes `src/shared/types/supabase.types.ts`.

## Architecture Boundaries
- Entry points: `src/main.tsx` -> `src/App.tsx` -> `src/app/router.tsx`.
- `/login` and `/registro` are public; everything else sits behind `AuthGuard` (`features/auth`), which redirects to `/login` when there's no Supabase session.
- Capture routes: `/captura/labor/:tipoLaborId/trabajadores` -> `/captura/labor/:tipoLaborId/trabajadores/:trabajadorId`. Labor type is picked from the `/supervisor` dashboard task list, not a dedicated capture screen. `/supervisor/trabajadores` is worker CRUD, `/supervisor/dashboard` is KPIs — both real features, not stubs.
- `features/captura/services/trabajadores-service.ts` re-exports from `features/trabajadores/services/` — the one sanctioned cross-feature service import. Don't add more; don't turn it into cross-feature component imports.
- Layering rule: components render only; hooks own state/effects/query; services own data access; utils are pure; constants are fixed seed data; stores are global Zustand state.
- Do not import components across feature boundaries. Shared UI primitives belong under `src/shared/components`.
- Keep files/functions small per `CLAUDE.md`: roughly 150 lines/file, 30 lines/function, max 5 component props, no `any`.

## UX Constraints
- `features/captura` is for low-literacy field users: icon-first, near-zero free text, large touch targets, numeric input via +/- steppers only. Do not add keyboard/number-pad entry there.
- Tailwind is v4 CSS-first. There is no `tailwind.config.js`; Tailwind is imported in `src/index.css` and wired by `@tailwindcss/vite` in `vite.config.ts`.
- Preserve the existing neumorphic visual tokens in `src/index.css` unless intentionally redesigning the app.

## Domain Sources
- The current finca constant is `src/shared/constants/finca.constants.ts` with id `birrisito`.
- Labor types come from `src/shared/constants/tipos-labor.constants.ts` and the Excel sheet names; do not hardcode labor behavior in screens. This now duplicates the seeded `public.labores` table — the frontend constant hasn't been switched to fetching from Supabase, so keep both in sync by hand if you add a labor type.
- Existing domain interfaces are in `src/shared/types/domain.types.ts`. `src/shared/types/supabase.types.ts` is the generated `Database` type, wired into `supabase-client.ts` (`createClient<Database>`) — regenerate with `pnpm db:types` after any schema change, don't hand-edit it.

## Supabase Rules For This Repo
- This repo is not AgroTrace. Do not use an `organizacion_id` model here; `CLAUDE.md` states the isolation axis is `finca_id` plus role-based RLS.
- Never put a service role key in frontend code. The frontend singleton is `src/shared/lib/supabase-client.ts` and uses Vite env vars.
- Never use `select('*')` in Supabase services; list columns and throw on `error`.
- Use soft delete columns (`activo`/`activa`) instead of physical deletes for business data.
- RLS policies join through `usuario` (`usuario.auth_user_id = auth.uid() and usuario.finca_id = <table>.finca_id and usuario.activo = true`), never a bare `finca_id` check against `auth.uid()` directly — follow this shape for any new farm-scoped table.
- **Every migration that creates a table must also `grant select, insert, update, delete on table public.x to authenticated;` explicitly.** The hosted Supabase project grants this by platform default (invisible in migration history), but the local CLI's `supabase db reset` revokes it — skipping the explicit grant means local dev silently 403s on real queries even though `tsc`/schema apply cleanly. Found this the hard way; see `CLAUDE.md`'s "Local dev ≠ remote" note.

## Migrations
- Create migrations with `supabase migration new nombre_snake_case_espanol`; do not hand-invent or rename timestamps. See `docs/instruccions/2-numeracion-migraciones.md`.
- Use one atomic migration per change and wrap schema/data changes in `begin;` / `commit;`.
- Enable RLS *and* grant table privileges to `authenticated` in the same migration that creates a table (see grant rule above).
- Do not edit migrations that may already be applied; create a new migration instead.
- After applying a migration (local or remote), run `supabase db reset` locally to confirm the full chain still applies clean — a migration that only exists remotely will drift.

## Generated/Local Artifacts
- PWA service worker behavior is from `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
- The only IndexedDB-backed thing left in capture is the in-progress draft autosave (`use-registro-draft.ts`, via `src/shared/lib/local-db.ts`) — a resilience layer for a half-filled form, not a source of truth. Actual registros, workers, auth, farms, and labor types are all Supabase.
