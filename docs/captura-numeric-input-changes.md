# Captura: labor badge + numeric input escribible

## 1. Badge labor actual (pantalla confirm horas/cantidad)

Pedido: antes confirm, mostrar qué labor se registra. Minimalista, icon-first.

- Nuevo: `src/features/captura/components/LaborActualBadge.tsx` — chip icon + nombre + color propio labor.
- `src/shared/components/LaborIcon.tsx` — agregado prop `style` (pintar icono con color labor).
- `src/features/captura/screens/CapturaRegistroScreen.tsx` — badge puesto entre steppers y botón Confirmar.

## 2. Input horas/cantidad: escribible + flechas

Pedido: permitir escribir número a mano, no solo +/-.

`src/shared/components/NumericStepper.tsx`:
- Span reemplazado por `<input type="number" inputMode="decimal">`.
- Flechas +/- (`StepperButton`) siguen igual.
- Focus -> select all (sobreescribir rápido).

**Nota:** contradice regla en `CLAUDE.md` ("numeric input solo via steppers, nunca teclado/numpad" — constraint por baja alfabetización). Cambio pedido explícito por user, override intencional. `CLAUDE.md` no actualizado aún (pendiente si user confirma).

## 3. Bug: no dejaba poner 0

Causa: input controlado directo por `value` numérico del padre. Borrar campo -> string vacío -> `onChange` no dispara -> `value` no cambia -> React fuerza DOM de vuelta al número viejo. 0 nunca entraba.

Fix: estado local `texto` (string) desacoplado del número:
- `useState(String(value))` + `useEffect` sync cuando `value` externo cambia (steppers).
- `manejarEscritura`: actualiza `texto` en cada tecleo, permite vacío transitorio.
- `manejarSalida` (blur): valida, clampa a rango, redondea, recién ahí sync con padre.

## 4. Validación: límite de rango + largo

Pedido: no dejar ingresar valores absurdos.

- `src/features/captura/constants/captura.constants.ts`: nuevas consts `HORAS_MAXIMAS_POR_DIA = 24`, `CANTIDAD_MAXIMA_POR_REGISTRO = 999`.
- `CapturaRegistroScreen.tsx`: steppers horas/cantidad ahora reciben `rango={{ min: 0, max: ... }}` (antes sin límite).
- `NumericStepper.tsx`: `longitudMaxima` = cantidad dígitos de `rango.max`. Trunca lo escrito a esa longitud en cada tecleo.
  - Ojo: atributo HTML `maxLength` **no funciona** en `input type="number"` (browser lo ignora). Truncado hecho en JS (`manejarEscritura`), no en atributo.
- Blur (`manejarSalida`) sigue de red de seguridad: clampa valores dentro del largo permitido pero fuera de rango (ej "99" con max 24 -> 24).

`SeleccionFechaScreen.tsx` (Año/Día) ya tenía rango propio, se beneficia igual sin cambios.

## Verificación

`pnpm exec tsc -b --noEmit` limpio en cada paso. Sin browser tool disponible en sesión -> no screenshot, solo revisión código + typecheck.
