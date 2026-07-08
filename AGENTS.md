# AGENTS.md

## Project Shape
- This is a single Vite React/TypeScript PWA, not a monorepo. The useful project docs are `CLAUDE.md` and `docs/instruccions/*.md`; `README.md` is still the Vite template.
- The app replaces `docs/mano de obra.xlsx` for Finca Birrisito labor capture. Current UI is only the supervisor/capataz capture flow; admin/oficina is not built yet.
- Backend is being introduced with Supabase, but current capture services still use constants/IndexedDB. Keep service signatures stable so IndexedDB can be swapped for Supabase later.

## Commands
- Use pnpm only: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm preview`.
- Definition of done is `pnpm build` then `pnpm lint`; there is no separate test runner today.
- Typecheck-only shortcut: `pnpm exec tsc -b --noEmit`.
- Supabase local type generation: `pnpm db:types` writes `src/shared/types/supabase.types.ts`.

## Architecture Boundaries
- Entry points: `src/main.tsx` -> `src/App.tsx` -> `src/app/router.tsx`.
- Capture routes: `/captura/labor/:tipoLaborId/trabajadores` -> `/captura/labor/:tipoLaborId/trabajadores/:trabajadorId`. Labor type is picked from the `/supervisor` dashboard task list, not a dedicated capture screen.
- Layering rule: components render only; hooks own state/effects/query; services own data access; utils are pure; constants are fixed seed data; stores are global Zustand state.
- Do not import components across feature boundaries. Shared UI primitives belong under `src/shared/components`.
- Keep files/functions small per `CLAUDE.md`: roughly 150 lines/file, 30 lines/function, max 5 component props, no `any`.

## UX Constraints
- `features/captura` is for low-literacy field users: icon-first, near-zero free text, large touch targets, numeric input via +/- steppers only. Do not add keyboard/number-pad entry there.
- Tailwind is v4 CSS-first. There is no `tailwind.config.js`; Tailwind is imported in `src/index.css` and wired by `@tailwindcss/vite` in `vite.config.ts`.
- Preserve the existing neumorphic visual tokens in `src/index.css` unless intentionally redesigning the app.

## Domain Sources
- The current finca constant is `src/shared/constants/finca.constants.ts` with id `birrisito`.
- Labor types come from `src/shared/constants/tipos-labor.constants.ts` and the Excel sheet names; do not hardcode labor behavior in screens.
- Existing domain interfaces are in `src/shared/types/domain.types.ts` until generated Supabase table types replace DB-facing types.

## Supabase Rules For This Repo
- This repo is not AgroTrace. Do not use an `organizacion_id` model here; `CLAUDE.md` states the planned isolation axis is `finca_id` plus role-based RLS.
- Never put a service role key in frontend code. The frontend singleton is `src/shared/lib/supabase-client.ts` and uses Vite env vars.
- Never use `select('*')` in Supabase services; list columns and throw on `error`.
- Use soft delete columns (`activo`/`activa`) instead of physical deletes for business data.

## Migrations
- Create migrations with `supabase migration new nombre_snake_case_espanol`; do not hand-invent or rename timestamps. See `docs/instruccions/2-numeracion-migraciones.md`.
- Use one atomic migration per change and wrap schema/data changes in `begin;` / `commit;`.
- Enable RLS in the same migration that creates a table.
- Do not edit migrations that may already be applied; create a new migration instead.

## Generated/Local Artifacts
- PWA service worker behavior is from `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
- Local capture persistence uses IndexedDB through `src/shared/lib/local-db.ts`; draft autosave and optimistic mutations are part of the offline-resilience path.
