---
name: bodega-module-state
description: Estado actual del módulo BODEGA: componentes, hooks, queries y patrones establecidos
metadata:
  type: project
---

El módulo BODEGA está activo en la branch `Jason/BodegaDetails`.

**Why:** Sistema de bodega para Empacadora La Trinidad — registro de insumos agrícolas, kardex, alistamiento.

**How to apply:** Antes de crear cualquier archivo, verificar que no exista ya (el módulo está avanzado).

## Tablas de DB
- `bodega` — tabla maestra de bodegas
- `movimiento_inventario` — kardex de entradas/salidas/ajustes
- `v_existencias_bodega` — view que agrega saldos por producto
- `proveedor` — tabla de proveedores
- `empleado` — tabla de empleados

## Queries en `apps/web/src/lib/queries/bodega/`
- `index.ts` — listarBodegas, listarExistencias, listarProveedores, listarEmpleados
- `movimientos.ts` — listarMovimientosBodega, listarMovimientosRecientes, registrarMovimiento, listarLotesPorVencer
- `types.ts` — MovimientoConProducto, RegistrarMovimientoPayload, ExistenciaRow, etc.
- `autorizacion.ts`, `proyeccion.ts`, `alistamiento.ts`

## Query keys (`qk.bodega.*` en keys.ts)
- `lista()`, `existencias()`, `movimientos()`, `movimientosRecientes()`, `porVencer()`, `proyeccion()`, `proveedores()`, `empleados()`, `alistamiento()`, `alistamientoCompletados()`

## Hooks principales
- `use-bodega-dashboard.ts` — dashboard overview
- `useBodegaData.ts` — data general
- `useMovimientosData.ts` — data para página de movimientos (usa key `['bodegas']` en lugar de `qk.bodega.lista()`)
- `use-movimiento-queries.ts` — queries secundarias para form de movimiento
- `use-bodega-movimientos-recientes.ts` — (NUEVO) últimos 20 movimientos + filtro tipo

## Componentes en `apps/web/src/components/bodega/`
- `KardexTable.tsx`, `KardexRow.tsx` — tabla de kardex
- `FormMovimiento.tsx`, `MovimientoFormBody.tsx` — form de registro
- `MovimientosFilterBar.tsx` — filtros avanzados del kardex
- `MovimientosRecientes.tsx` — (NUEVO) panel de últimos movimientos, presentacional
- `dashboard/UltimosMovimientosCard.tsx` — card del dashboard (similar a MovimientosRecientes)
- `HistorialMovimientosMini.tsx` — historial colapsable dentro de modales
- `TablaExistencias.tsx`, `ProductoInfoStrip.tsx`
- `alistamiento/` y `alistamiento-calendario/` — secciones de alistamiento semanal

## Patrones
- `listarBodegas` se llama con dos cache keys distintos: `qk.bodega.lista()` (dashboard/recientes) y `['bodegas']` (useMovimientosData). Ambos son válidos; TanStack Query los trata como cachés separados.
- No hay tests unitarios en el web workspace (sin script `test` en package.json).
- Typecheck (`pnpm typecheck`) es el gate de calidad principal.
- Soft delete: campo `activo`/`anulada`. `listarBodegas` filtra `.eq('activa', true)`.

## Decisiones de diseño
- `MovimientosRecientes` solo se muestra cuando NO hay filtro de producto activo (cuando hay producto seleccionado, el KardexTable ya da el historial completo de ese producto).
- Los filtros rápidos de tipo solo se renderizan si hay más de un tipo de movimiento en los datos (ponytail: no mostrar filtros inútiles).
- `useBodegaMovimientosRecientes` es self-contained: obtiene la bodega internamente, no requiere prop `bodegaId`.
