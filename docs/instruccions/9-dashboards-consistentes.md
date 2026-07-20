# Dashboards consistentes

Regla: todos los dashboards del admin (`AdminDashboardScreen`, `FincaDashboardScreen`, y cualquier dashboard futuro) comparten mismo layout, mismos componentes, mismo estilo visual.

## Qué implica

Cambio pedido en un dashboard (layout, KPI cards, charts, colores, spacing, loading state) -> aplica a **todos** los dashboards, no solo al que se nombró en el pedido.

## Por qué

Ambos dashboards ya comparten los mismos bloques compartidos:

- `DashboardKpiRow`
- `RankingBarChart`
- `TendenciaLineChart`
- mismo header (`neu-raised` + título + descripción)
- mismo estado `isLoading` -> `"Cargando datos…"`

Divergencia entre ellos = deuda visual, confunde al admin al navegar entre "Dashboard" y "Dashboard por finca".

## Cómo aplicar

- Cambio de estilo/estructura -> tocar los 2 (o N) screens de dashboard en el mismo PR.
- Cambio de lógica de cálculo (KPIs, ranking, tendencia) -> ya vive en `shared/utils/kpis/*`, reusado por ambos hooks (`use-admin-rollup-kpis.ts`, `use-finca-dashboard-kpis.ts`) -> tocar el util una vez alcanza.
- Si un dashboard nuevo necesita divergir a propósito (ej. comparativa entre fincas, con otro tipo de gráfico) -> no es "el mismo dashboard", documentar la excepción acá antes de romper la regla.

## Archivos afectados hoy

- `src/features/admin/screens/AdminDashboardScreen.tsx`
- `src/features/admin/screens/FincaDashboardScreen.tsx`
- `src/features/admin/hooks/use-admin-rollup-kpis.ts`
- `src/features/admin/hooks/use-finca-dashboard-kpis.ts`
