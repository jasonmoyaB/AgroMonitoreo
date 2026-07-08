# AgroMonitoreo

PWA (React + TypeScript) reemplaza planilla Excel (`docs/mano de obra.xlsx`) pa' registro diario mano de obra en finca **Birrisito** (Chile).

## Problema

Capataz anota a mano: trabajador, labor, horas, cantidad producida. Productividad (cantidad/horas) calculada manual en Excel. Lento, error-prone, sin foto ni respaldo.

## Solución

App captura ("features/captura") pa' capataz en campo:

- Grid iconos, sin texto libre (muchos trabajadores baja alfabetización)
- Touch targets grandes (≥88px), steppers +/- pa' números (nunca teclado)
- Flujo: elegir labor → elegir trabajador (foto/iniciales, check verde si ya cargado hoy) → horas + cantidad → confirmar
- App calcula productividad sola

Guarda en IndexedDB hoy (sin backend aún). Plan: Supabase (Postgres+Auth+RLS), aislamiento por `finca_id`.

Resiliente a caída conexión: autosave local (300ms debounce) + retry mutación (3x) + service worker PWA.

## Roles

- **supervisor/capataz**: carga datos campo (único implementado)
- **admin/oficina**: dashboard, métricas, gestión (próxima fase, no construido)

Flujo un sentido: supervisor → admin. Sin flujo reverso.

## Stack

React + TypeScript + Vite, Tailwind v4, TanStack Query, Zustand, idb-keyval.

## Comandos

Package manager: **pnpm solo** (no npm/yarn).

```bash
pnpm install          # deps
pnpm dev              # dev server
pnpm build            # typecheck + build, debe pasar
pnpm exec tsc -b --noEmit   # solo typecheck
pnpm lint             # oxlint
pnpm preview          # preview build prod
```

Sin test runner configurado aún.

## Estructura

Ver `CLAUDE.md` pa' detalle arquitectura, capas, y convenciones.
