# AgroMonitoreo

PWA (React + TypeScript) reemplaza planilla Excel (`docs/mano de obra.xlsx`) pa' registro diario mano de obra en finca **Birrisito** (Costa Rica).

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
- **admin/oficina**: implementado (`features/admin`) — dashboards, CRUD fincas, CRUD supervisores, trabajadores/asistencia multi-finca, planilla quincenal (los salarios se editan adentro, no hay `/admin/salarios`), traslados

No hay signup público: el admin invita por correo desde `/admin/supervisores`. El invitado nace `supervisor` y **sin finca**; hasta que el admin se la asigne ve la pantalla `SinFincaAsignada`.

Flujo un sentido: supervisor → admin. Sin flujo reverso.

## Lo logrado (recién)

- **Alta solo por invitación**: `enable_signup = false` y edge function `invitar-usuario` (única del repo, es la que tiene el `service_role`). Correos por SMTP de Resend. El invitado nace `supervisor` sin finca; asignarla es un paso explícito del admin
- **Salarios y planilla**: salario mensual por trabajador (`usd`/`colones`), quincena = mitad, editable en la propia fila de `/admin/planilla`. Valor hora por finca en colones y en USD (`fincas.valor_hora`, `valor_hora_usd`): fija el costo del día ausente (valor hora × 8). El pago congela `monto`, `moneda`, `monto_bruto` y `dias_ausentes` — subir un salario después no reescribe lo ya pagado
- **Ausencias en planilla**: cada ausencia de la quincena descuenta un día del monto. Cuentan los tres tipos; el neto nunca baja de 0
- **Datos personales**: cédula, fecha de ingreso y teléfono del trabajador en tabla propia `datos_trabajadores` (PII fuera de `trabajadores`, misma razón que el salario); datos del propio usuario en columnas de `usuario`. La cédula autocompleta el nombre contra la API pública de Hacienda
- **Traslados**: préstamo de trabajador entre fincas por un día (pendiente/aprobado/rechazado), sin devolución manual — vence por fecha. Badges en origen y destino
- **Auth hardening**: cooldown de login tras intentos fallidos, recuperación de password en producción, rol y finca hardcodeados server-side (nunca se lee metadata del cliente)
- **Módulo Admin completo**: dashboard rollup + por finca, CRUD fincas/supervisores, trabajadores y asistencia por finca
- **Asistencia**: marcar ausente/presente, tabla semanal, calendario mensual, export PDF
- **PDFs con sistema de diseño propio**: motor `shared/lib/pdf-doc.ts` + tokens/estilos/tabla en `shared/utils/pdf/`, sin librería externa. Reglas en `docs/PATRONES-DISENO-PDF.md`, con test de área segura
- **Métricas/KPIs**: horas extras (`docs/horas-extra.md`), ranking labores/trabajadores, producción diaria y horas por labor — `shared/utils/kpis/`, compartidos por los 3 dashboards
- **Supabase hardening**: grants explícitos por tabla, scoping por `private.finca_del_usuario()`, helpers `SECURITY DEFINER` en schema `private` (fuera de PostgREST), policies fusionadas a una por tabla+acción, y la fecha futura de `registros_trabajo` rechazada por trigger y no solo por el cliente
- 60 tests con vitest, MCP `codebase-memory` pa' navegar el repo

## Stack

React + TypeScript + Vite, Tailwind v4, TanStack Query, Zustand, Supabase (Postgres+Auth+RLS+Storage).

## Comandos

Package manager: **pnpm solo** (no npm/yarn).

```bash
pnpm install          # deps
pnpm dev              # dev server
pnpm build            # typecheck + build, debe pasar
pnpm exec tsc -b --noEmit   # solo typecheck
pnpm exec vitest run  # tests (o `pnpm test`)
pnpm lint             # oxlint
pnpm db:types         # regenerar src/shared/types/supabase.types.ts tras una migracion
pnpm preview          # preview build prod

pnpm dlx react-doctor --verbose   # debe dar 100%
```

## Estructura

Ver `CLAUDE.md` pa' detalle arquitectura, capas, backend Supabase, y convenciones.
