# Patron para calendarios

Todo calendario nuevo debe seguir el patron usado en `CalendarioAusentesPanel`.

## Reglas de UX

- El calendario debe mostrar una grilla mensual con 7 columnas.
- Los nombres largos no deben depender del espacio de la celda.
- Si un dia tiene muchos registros, la celda solo muestra un resumen corto.
- Al tocar un dia con registros, debe abrirse o mostrarse un panel de detalle con la lista completa.
- El detalle debe soportar scroll para 8, 10 o mas registros sin cortar contenido.
- Los dias sin registros no deben parecer accionables.
- Todo boton o dia clickeable debe tener `cursor-pointer` y `focus-visible`.
- Mantener targets tactiles de minimo 44px.

## Estructura recomendada

- Componente de calendario: solo render y callbacks.
- Hook: estado de mes, anio, dia seleccionado y queries.
- Service: acceso Supabase, sin estado ni UI.
- Utils: fechas, agrupaciones y calculos puros.
- Constants: dias de semana, labels fijos y query keys.

## Patron visual

- Usar el mismo lenguaje neumorfico existente.
- Modal grande para calendarios de lectura: `size="xl"`.
- Cabecera con mes/anio centrado y flechas laterales.
- Celdas con dia, contador y maximo 3 items visibles.
- Panel de detalle lateral en desktop; en mobile debe caer debajo de la grilla.
- Evitar colores fuertes si compiten con la informacion.

## Componentes de referencia

- `src/features/supervisor/components/CalendarioAusentesPanel.tsx`
- `src/features/asistencia/hooks/use-calendario-ausentes.ts`
- `src/features/asistencia/utils/obtener-espacios-calendario.ts`
- `src/features/asistencia/constants/calendario.constants.ts`

## Checklist antes de entregar

- [ ] Busque si ya existe un calendario reutilizable o parecido.
- [ ] La celda no intenta mostrar listas completas.
- [ ] Existe una vista de detalle para todos los registros del dia.
- [ ] El calendario funciona con mas de 6 registros por dia.
- [ ] El modal usa espacio suficiente (`xl` si es calendario mensual).
- [ ] Build y lint pasan con `pnpm build` y `pnpm lint`.
