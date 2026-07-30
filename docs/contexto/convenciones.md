# Convenciones

## Idioma

Todo en español: nombres de funciones (`calcularMontoQuincena`, `listarPagosQuincena`), campos del dominio (`trabajadorId`, `montoQuincena`), nombres de tests, mensajes de toast. Muchos comentarios están sin tildes — no normalizarlos, no vale el diff.

## Nombres de archivo

| Tipo | Formato | Ejemplo |
|---|---|---|
| Componentes y screens | `PascalCase.tsx` | `PlanillaTable.tsx`, `SalariosScreen.tsx` |
| Hooks | `use-kebab-case.ts` | `use-planilla-quincena.ts` |
| Services | `<dominio>-service.ts` | `planilla-service.ts` |
| Utils | verbo en infinitivo, kebab | `calcular-monto-quincena.ts`, `construir-filas-planilla.ts`, `obtener-rango-quincena.ts`, `filtrar-trabajadores.ts`, `validar-foto-trabajador.ts` |
| Types | `*.types.ts` | `planilla.types.ts` |
| Constants | `*.constants.ts` | `quincena.constants.ts` |

Verbos de util que ya se usan: `calcular-`, `construir-`, `obtener-`, `filtrar-`, `agrupar-`, `validar-`, `resumir-`, `formatear-`, `leer-`.

## Límites duros

~150 líneas por archivo · ~30 líneas por función · ≤3 parámetros (más allá, un objeto) · ≤5 props por componente · sin `any` (usar `unknown` + narrowing) · sin números ni strings mágicos sin nombre.

## Patrones que usamos

- **Query keys**: siempre constante exportada en `constants/*-query.constants.ts` (`PLANILLA_QUERY_KEY`, `TRABAJADORES_QUERY_KEY`, `TRASLADOS_QUERY_KEY`, `ASISTENCIA_*_QUERY_KEY`, `REGISTROS_*_QUERY_KEY`, `FINCAS_QUERY_KEY`, `SALARIOS_QUERY_KEY`, `SUPERVISORES_QUERY_KEY`). Nunca un string inline.
- **Services inyectables**: último parámetro `client: SupabaseClient = supabase`, para poder testear el service sin red.
  ```ts
  export async function listarPagosQuincena(fincaId: string, quincenaInicio: string, client: SupabaseClient = supabase): Promise<PagoQuincenal[]>
  ```
- **Errores**: `if (error) throw new Error(\`nombreFuncion: ${error.message}\`)`. Siempre chequear `error`, nunca ignorarlo.
- **Mapeo explícito** de `snake_case` (fila) a `camelCase` (dominio) dentro del service, con una `interface *Row` local para tipar la respuesta.
- **Toasts** desde los hooks `*-crud.ts` vía `useToastStore`, en pasado y corto ("Quincena pagada", "Trabajador agregado"). Regla completa: `docs/instruccions/3-notificaciones-toast.md`.
- **Soft delete** (`activo` / `activa`), nunca borrado físico de datos de negocio.
- **Columnas explícitas** en cada `.select(...)`.

## Prohibidos

- `select('*')`
- Service role key en el front
- Un segundo `createClient` — solo `shared/lib/supabase-client.ts`
- `npm` / `yarn`
- Editar a mano `src/shared/types/supabase.types.ts` (se regenera con `pnpm db:types`)
- Que un componente importe componentes de otra feature (hooks/utils sí, cuando el dato nace ahí)
- Librerías externas de toast/notificaciones
- Renombrar a mano el timestamp de una migración, o editar una ya aplicada

## Tests

- vitest. Viven en **`/test` raíz espejando `src/`**, no colocados: `src/features/planilla/utils/foo.ts` → `test/features/planilla/utils/foo.test.ts`.
- Se testean utils y services con ramificación real (validación, cálculos, fechas). Los one-liners no.
- Nombres de `it()` en español, en indicativo: `it('febrero bisiesto termina el 29')`.
- `vitest.config.ts` está separado de `vite.config.ts` **a propósito**: vitest 3.2 declara `vite ^5||^6||^7` y pnpm le resuelve vite 7, así que mezclar ambos juegos de tipos rompe `tsc -b`.
- Ese config fija `TZ: 'America/Costa_Rica'`. Sin eso, un runner en UTC deja pasar en verde todo test de "el día local no es el día UTC", que es justo la clase de bug que más duele acá.

## Estilo visual

Tokens neumórficos declarados como `@utility` en `src/index.css`: `neu-raised`, `neu-raised-sm`, `neu-pressed`, `neu-well`. Usarlos, no reimplementar las sombras a mano. Reglas de layout responsive: `docs/RESPONSIVE.md`. Patrón de calendarios: `docs/instruccions/6-patron-calendarios.md`.

`features/captura` tiene una restricción de UX no negociable: usuarios de campo con baja alfabetización → primero iconos, casi nada de texto libre, targets táctiles ≥88px, números solo con steppers +/− (nunca teclado ni pad numérico).

## Commits

Se trabaja con rama por feature y PR a `main` (el historial tiene merges desde `Dashboard`, `RateLimit`, `Admin/Feature`, `Planilla`).

`[PENDIENTE: no hay convención de mensaje escrita. El historial mezcla mensajes cortos en español ("filtros admin", "transpasos", "tests2") con los autogenerados por la UI de GitHub ("Update src/..."). Definir si se adopta Conventional Commits o se deja libre.]`
