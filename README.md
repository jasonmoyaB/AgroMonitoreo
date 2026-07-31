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

- **supervisor/capataz**: carga datos campo, gestión trabajadores (`features/trabajadores`), asistencia diaria (`features/asistencia`), traslados entre fincas (`features/traslados`), perfil propio (`features/perfil`), KPIs (`features/supervisor`)
- **admin/oficina**: implementado (`features/admin`) — dashboards, CRUD fincas, CRUD supervisores, trabajadores/asistencia multi-finca, salarios, traslados

Flujo un sentido: supervisor → admin. Sin flujo reverso.

## Lo logrado (recién)

- **Salarios**: admin fija salario mensual por trabajador (`usd`/`colones`), quincena = mitad. Valor hora por finca en colones y en USD (`fincas.valor_hora`, `valor_hora_usd`): fija el costo del día ausente (valor hora × 8)
- **Ausencias en planilla**: cada ausencia de la quincena descuenta un día del monto. Cuentan los tres tipos; el neto nunca baja de 0
- **Traslados**: préstamo de trabajador entre fincas por un día (pendiente/aprobado/rechazado), sin devolución manual — vence por fecha. Badges en origen y destino
- **Auth hardening**: cooldown de login tras intentos fallidos, recuperación de password, signup siempre `supervisor`+`birrisito` server-side
- **Módulo Admin completo**: dashboard rollup + por finca, CRUD fincas/supervisores, trabajadores y asistencia por finca
- **Asistencia**: marcar ausente/presente, tabla semanal, calendario mensual, export PDF
- **Métricas/KPIs**: horas extras (`docs/horas-extra.md`), ranking labores/trabajadores, tendencia diaria — `shared/utils/kpis/`
- **Supabase hardening**: grants explícitos por tabla, RLS join-through-`usuario`, revoke EXECUTE funciones internas
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
