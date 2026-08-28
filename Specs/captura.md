# Spec — captura

El flujo del capataz en el campo. Es la única pantalla que usa alguien que no trabaja en oficina, y por eso tiene la restricción de UX más dura del repo.

## Flujo

```
/supervisor                                    lista de labores (iconos)
  → /captura/labor/:tipoLaborId/trabajadores   grid de trabajadores
    → .../:trabajadorId                        horas + cantidad → confirmar
```

`/captura/fecha` permite cargar un día pasado.

## Restricción de UX (no negociable)

Usuarios con baja alfabetización:

- Primero iconos, casi nada de texto libre.
- Targets táctiles **≥88px**.
- Números **solo** con steppers `+`/`−`. Nunca teclado, nunca pad numérico.

## Reglas

- Horas: paso de `0.5`, tope 24/día. Cantidad: tope 999 por registro. La unidad del stepper sale de la labor (`cajas`, `tramos`, …).
- **Nunca fecha futura.** `ajustar-fecha-a-limites.ts` lo acota en el cliente; el trigger `private.rechazar_fecha_futura_registro()` lo rechaza en la base. Las dos capas, porque una regla que solo vive en el cliente no es una regla.
- Año mínimo: 2024.
- `registrado_por` lo pone la base por default (`usuario_actual_id()`). El cliente no lo manda.
- El grid marca con check verde a quien ya tiene registro hoy, y bloquea a quien está ausente o trasladado — para eso lee hooks de `asistencia` y `traslados`.
- **Draft en IndexedDB** con debounce de 300ms (`use-registro-draft.ts`): resiliencia para un form a medias, no fuente de verdad.
- Los registros se leen **paginados** (`registros-service.ts`). PostgREST corta en 1000 filas sin avisar: el mes se acota además por fecha, y el historial de un trabajador solo se defiende paginando, porque el modal de métricas necesita todo.
- **Se puede capturar sin señal.** El cache de queries se persiste en IndexedDB (`shared/hooks/use-cache-persistente.ts`), así que la lista de trabajadores sigue estando; la mutación queda pausada, se guarda con el cache y se reenvía sola al reconectar. La confirmación distingue los dos casos: check verde = el servidor lo tiene, nube ámbar = pendiente de enviar. `RegistrosPendientesBadge` muestra cuántos faltan.
- El reenvío es seguro porque `crearRegistro` es un `upsert` sobre el unique `(trabajador_id, tipo_labor_id, fecha)`: mandarlo dos veces deja una fila.
- Solo se persiste lo que la captura offline necesita (`src/app/claves-persistibles.ts`, allowlist). La planilla y los datos personales **nunca** van al disco.
- Al cerrar sesión el cache persistido se borra (`limpiarCacheQuery`): guarda nombres de trabajadores y el dispositivo de campo se comparte. Si el `signOut` falla por falta de red la sesión local sigue viva, así que no se navega ni se vacía nada — se avisa con un toast, que es lo único honesto que se puede hacer offline.

## Qué NO hace

- **No es offline-first.** Se puede capturar sin señal con lo que ya se leyó antes, pero no es una base local: nada se resuelve del lado del dispositivo, y un trabajador dado de alta en otro equipo no aparece hasta reconectar.
- No edita ni borra registros ya cargados.
- `services/trabajadores-service.ts` **re-exporta** de `features/trabajadores`; no duplica la query.
