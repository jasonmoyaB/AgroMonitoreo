# Spec — traslados

Préstamo de un trabajador a otra finca **por un día**. Se monta en `/supervisor/traslados` (solicitar y ver el historial propio) y `/admin/traslados` (ver y resolver todas).

## Flujo

```
supervisor destino solicita  →  estado 'pendiente'
supervisor origen / admin resuelve  →  'aprobado' | 'rechazado'
```

## Reglas

- **No hay acción de devolución.** El préstamo vence solo, por scoping de fecha. Menos estado que mantener.
- Un índice único parcial impide una **segunda fila viva** por trabajador + día.
- `resolver_traslado_trabajador()` congela la fila: sella `resuelto_por` / `resuelto_en`, rechaza actualizar una ya resuelta, y fija `trabajador_id`, `fecha` y ambas fincas a sus valores originales. Aprobar solo puede mover `estado`.
- Un check constraint rechaza origen = destino.
- Dos caras del mismo traslado: **prestado** es el lado destino (badge "De {finca}"), **trasladado** el lado origen (bloquea seleccionarlo ese día en captura).
- **El mínimo de fecha se calcula en el render, nunca a nivel de módulo.** La PWA queda abierta de un día para el otro y un mínimo congelado deja pedir traslados para fechas pasadas.
- Al resolver varios de golpe: `Promise.allSettled`, no `Promise.all` — el primero corta en el primer rechazo y deja sin reportar las escrituras que sí entraron. El conteo real lo arma `resumir-resultados.ts`.
- En el service, **dos `.eq()` y nunca `.or()`**: `.or()` recibe un string de filtro y termina interpolando `fincaId` sin escapar.

## Qué NO hace

- No mueve al trabajador de finca en `trabajadores`. La fila original no se toca.
- No traslada por más de un día ni por rango.
