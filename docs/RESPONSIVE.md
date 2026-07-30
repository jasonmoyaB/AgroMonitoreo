# Responsive — reglas del proyecto

Tailwind v4, mobile-first. Breakpoints reales de test: 375px, 768px (`sm`/`md`), 1024px, 1440px.

## Shell de pantalla (todas las screens supervisor)

```
<main className="h-dvh overflow-hidden p-3 sm:p-4">
  <div className="flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4">
    <SupervisorSidebar />
    <section className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
      <header>...</header>
      {contenido}
    </section>
  </div>
</main>
```

- Mobile: sidebar arriba, contenido abajo (`flex-col`). Desktop: lado a lado (`md:flex-row`).
- `header` VA DENTRO de la misma `<section overflow-y-auto>` que el contenido → en mobile se sube con el scroll (no queda pineado). Si el header queda afuera con `shrink-0` en su propio div, no se sube — es bug, no feature (pasó en `SupervisorDashboardScreen`, fix en 2026-07-10).
- `min-h-0` en section es obligatorio junto a `flex-1` — sin eso el scroll interno no funciona dentro de un flex container.

## Sidebar / navbar (`SupervisorSidebar.tsx`)

Un solo estado `isCollapsed` compartido, comportamiento distinto por breakpoint:

- **Desktop (`md:`)**: nunca se oculta del todo. Colapsado = rail de iconos (`md:w-20`), expandido = `md:w-72`. Labels se esconden con `sr-only`.
- **Mobile**: colapsado = oculta nav + botón salir por completo (`hidden`), solo queda logo + botón toggle. Expandido = todo visible apilado.
- Patrón para lograr esto: base class `hidden` (o toggle `hidden`/`flex`) + `md:flex` siempre presente. Tailwind resuelve el override en el breakpoint sin pelear con la clase base:
  ```
  className={`${isCollapsed ? 'hidden' : 'flex'} ... md:flex`}
  ```
- El `aside` lleva `max-h-[50dvh] overflow-y-auto overscroll-contain md:max-h-none`. Sin ese tope, con el menú desplegado en mobile el aside (`shrink-0`) se comía el `h-dvh` entero y la `<section>` de contenido quedaba en **0px de alto**: el contenido existía (`scrollHeight` 1703) pero `main overflow-hidden` lo recortaba completo. Medido en `AdminSidebar` (9 ítems + perfil + salir = 700px con viewport de 710px). Si se agregan ítems al nav, el tope es lo que impide que vuelva a pasar.

## Grids

- `grid-cols-N` solo si hay ≥ N hijos reales. Un wrapper `grid grid-cols-2` con un solo hijo lo deja a mitad de ancho en mobile (bug real, encontrado en el badge de fecha de `SupervisorDashboardScreen`). Si es un solo item, no envolver en grid.
- Grids con contenido real (`DashboardKpiRow`, opciones de labor en `LaborTaskCard`, `TrabajadorForm`) sí llevan `grid-cols-2` porque tienen 2+ hijos.

## Tablas

Nunca dejar que una tabla angosta el viewport. Patrón fijo en `TrabajadoresTable`, `AsistenciaTable`, `TrabajadorMetricasTabla`:

```
<div className="overflow-x-auto">
  <table className="w-full min-w-[32rem] border-collapse text-left">
```

Scroll horizontal contenido en el wrapper, la página nunca scrollea horizontal.

Cuando la tabla tiene 4+ columnas de texto largo el `min-w` deja media tabla fuera de pantalla en mobile y el scroll horizontal no se ve venir (pasó en traslados, `min-w-[44rem]` a 375px). En ese caso, apilar la fila en vez de scrollear — sin `min-w`, sin markup duplicado:

```
<thead className="hidden sm:table-header-group">
<tr className="block border-b px-5 py-4 sm:table-row sm:px-0 sm:py-0">
<td className="block sm:table-cell sm:px-5 sm:py-3">
```

Referencia: `traslados/components/TrasladosTable.tsx` y `TrasladosPendientesTable.tsx`.

## Touch targets

Mínimo `min-h-11` (44px) en botones icon-only, `min-h-12`–`min-h-14` en botones con texto/steppers. Nunca number pad — steppers +/- (ver `NumericStepper`, constraint de UX en `CLAUDE.md`).
