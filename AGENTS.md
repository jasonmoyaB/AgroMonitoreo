# AGENTS.md

`CLAUDE.md` is the source of truth for architecture, backend and conventions; `MAPA.md` is the path index. This file holds only the rules an agent breaks most often.

## Shape

Single Vite React/TS PWA — not a monorepo. Entry: `src/main.tsx` → `src/App.tsx` → `src/app/router.tsx`. Backend is live Supabase (Postgres + Auth + RLS + Storage); the only IndexedDB left is the in-progress capture draft.

## Done means

`pnpm build` (tsc + vite) → `pnpm lint` → `pnpm exec vitest run` all pass. pnpm only, never npm/yarn. After a migration, regenerate types with `pnpm db:types` — never hand-edit `src/shared/types/supabase.types.ts`.

## Supabase

- Not AgroTrace: isolation is `finca_id`, never `organizacion_id`.
- Never a service role key in frontend code. Single client: `src/shared/lib/supabase-client.ts`.
- Never `select('*')` — list columns, throw on `error`.
- Soft delete (`activo`/`activa`), never physical deletes of business data.
- RLS joins through `usuario` (`usuario.auth_user_id = auth.uid() and usuario.finca_id = <tabla>.finca_id and usuario.activo = true`).
- **Every migration creating a table must also `grant select, insert, update, delete on table public.x to authenticated;`** — without it local dev 403s while the schema applies clean. See `CLAUDE.md`.

## Migrations

`supabase migration new nombre_snake_case_espanol` — never hand-invent or rename timestamps. One atomic change per migration, wrapped in `begin;`/`commit;`. Never edit an applied migration; add a new one. Run `supabase db reset` after to confirm the chain still applies.

## Boundaries

Components render only; hooks own state/query; services own data access; utils are pure. Components never cross feature boundaries — shared UI goes in `src/shared/components`. Keep to ~150 lines/file, ~30 lines/function, ≤5 props, no `any`.

## UX

`features/captura` is for low-literacy field users: icon-first, near-zero free text, big touch targets, +/- steppers only — no keyboard/number-pad entry there. Tailwind v4 CSS-first (no config file); preserve the neumorphic tokens in `src/index.css` unless deliberately redesigning.

## Domain

Labor types: `src/shared/constants/tipos-labor.constants.ts` — duplicates the seeded `public.labores` table, keep both in sync by hand. Don't hardcode labor behavior into screens. Domain interfaces: `src/shared/types/domain.types.ts`.
