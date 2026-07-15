# AgroMonitoreo

PWA (React + TypeScript) reemplaza planilla Excel (`docs/mano de obra.xlsx`) pa' registro diario mano de obra en finca **Birrisito** (Chile).

## Problema

Capataz anota a mano: trabajador, labor, horas, cantidad producida. Productividad (cantidad/horas) calculada manual en Excel. Lento, error-prone, sin foto ni respaldo.

## Solución

App captura (`features/captura`) pa' capataz en campo:

- Grid iconos, sin texto libre (muchos trabajadores baja alfabetización)
- Touch targets grandes (≥88px), steppers +/- pa' números (nunca teclado)
- Flujo: elegir labor → elegir trabajador (foto/iniciales, check verde si ya cargado hoy) → horas + cantidad → confirmar
- App calcula productividad sola

Backend real ya: Supabase (Postgres + Auth + RLS + Storage), aislamiento por `finca_id`. Únicos IndexedDB hoy: draft en progreso (resiliencia, no fuente verdad).

Resiliente a caída conexión: autosave local (300ms debounce) + retry mutación (3x) + service worker PWA.

## Roles

- **supervisor/capataz**: carga datos campo, gestión trabajadores (`features/trabajadores`), asistencia diaria (`features/asistencia`), KPIs (`features/supervisor`)
- **admin/oficina**: implementado (`features/admin`) — dashboard, CRUD fincas, CRUD supervisores, ver trabajadores/asistencia multi-finca

Flujo un sentido: supervisor → admin. Sin flujo reverso.

## Lo logrado (recién)

- **Auth hardening**: rate-limit login (cooldown tras intentos fallidos, `use-login-cooldown.ts` + migración `bloqueo_login_intentos_fallidos`), signup ya no confía rol/finca de metadata cliente (siempre `supervisor`+`birrisito` server-side)
- **Módulo Admin completo**: dashboard, CRUD fincas, CRUD supervisores, vista trabajadores/asistencia por finca — soporte multi-finca real
- **Asistencia**: marcar ausente/presente, tabla semanal, calendario mensual, export PDF
- **Métricas/KPIs**: horas extras, ranking labores/trabajadores, tendencia diaria — `shared/utils/kpis/`
- **Supabase Advisors hardening**: grants explícitos por tabla, RLS join-through-`usuario`, revoke EXECUTE funciones internas
- Tests con vitest, MCP `codebase-memory` pa' navegar el repo

## Stack

React + TypeScript + Vite, Tailwind v4, TanStack Query, Zustand, Supabase (Postgres+Auth+RLS+Storage).

## Comandos

Package manager: **pnpm solo** (no npm/yarn).

```bash
pnpm install          # deps
pnpm dev              # dev server
pnpm build            # typecheck + build, debe pasar
pnpm exec tsc -b --noEmit   # solo typecheck
pnpm exec vitest run  # tests
pnpm lint             # oxlint
pnpm preview          # preview build prod
```

## Estructura

Ver `CLAUDE.md` pa' detalle arquitectura, capas, backend Supabase, y convenciones.
