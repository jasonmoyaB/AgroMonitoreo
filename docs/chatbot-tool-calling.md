# Chatbot de consulta para el admin — tool calling, no RAG

**Estado: no implementado.** Diseño analizado el 2026-08-03, guardado para cuando se retome.

## El problema

El admin de oficina consulta datos leyendo tablas y dashboards. La idea es preguntarlos en lenguaje natural: "cuántas horas hizo Juan en julio", "cuánto se pagó la quincena pasada", "quién faltó más este mes".

## Por qué NO RAG con embeddings

Se planteó RAG + embeddings + pgvector. **No sirve para este proyecto.**

Los datos son estructurados: números, fechas, filas. Las preguntas son agregaciones — `SUM()` con `WHERE`. Los embeddings buscan por parecido semántico: devuelven filas *parecidas*, no la suma *correcta*. El resultado son respuestas plausibles y falsas, que es peor que no tener bot: nadie detecta que el número está mal.

Dónde sí tendría sentido RAG acá: sobre `docs/` (manuales, instrucciones). Pero ese corpus es chico y cabe entero en el contexto — pegarlo directo, sin pipeline de indexado.

*Descartado*: RAG, embeddings, pgvector, cualquier índice vectorial.

## Por qué SÍ tool calling

Claude elige entre N herramientas fijas; cada una envuelve un service que **ya existe** en `src/features/*/services/`. Los números salen de Postgres → exactos. Cero infra de indexado.

Los services del repo ya son tool-shaped: params escalares, retorno serializable a JSON, sin estado, y con `client: SupabaseClient = supabase` como último param.

## Restricción dura: no hay backend

`api/`, `supabase/functions/` y `server/` no existen. `vercel.json` solo tiene el rewrite SPA. La API key de Anthropic **no puede vivir en el front** — Vite hornea las `VITE_*` en el bundle.

Hace falta **una** función serverless: `api/chat.ts` en Vercel (el repo ya despliega ahí). Una Edge Function de Supabase sería runtime Deno + deploy aparte + secrets aparte, sin ganar nada.

## Decisión clave: las tools corren en el navegador

```
navegador                              Vercel Function          Anthropic
─────────                              ───────────────          ─────────
use-chat.ts
  │ POST /api/chat {messages, tools}  ──►  verifica JWT   ──►  messages.create
  │                                         (solo lleva
  │                                          la API key)
  │ ◄── stop_reason: "tool_use" ────────────────────────────────────┘
  │
  ├─ ejecuta el service local (cliente Supabase con la sesión del admin → RLS)
  ├─ agrega el resultado como tool_result
  │
  └─ POST /api/chat otra vez  ──►  ...  ──►  respuesta final
```

Tres razones:

1. **Reusa los services tal cual**, sin duplicar queries.
2. **RLS aplica sola.** El cliente Supabase ya tiene la sesión del admin. Cero forwarding de JWT, cero segundo `createClient`.
3. **Importar los services desde `api/chat.ts` no compila.** El default param `client = supabase` evalúa `shared/lib/supabase-client.ts`, que lee `import.meta.env.VITE_*` — `undefined` en Node → `createClient(undefined, undefined)` tira al importar. Esta es la trampa que descarta la alternativa "tools en el servidor".

Costo: 2–3 round trips por respuesta. El proxy queda en ~40 líneas.

Que el cliente controle los `tool_result` **no es un agujero**: el cliente ya *es* el usuario, y RLS acota lo que puede leer.

## Seguridad del proxy — no se salta

`api/chat.ts` **tiene** que verificar el JWT de Supabase (`auth.getUser(token)` con la anon key) antes de llamar a Anthropic. Sin eso, la API key es un relay abierto: cualquiera con la URL gasta tokens contra la cuenta.

Además, chequear que el rol sea `admin_oficina` leyendo la propia fila de `usuario`. La ruta está detrás de `RouteGuard soloAdmin`, pero eso es solo cliente — un `curl` lo esquiva.

Env var: `ANTHROPIC_API_KEY`, **sin** prefijo `VITE_`.

## Regla que manda el diseño de las tools

**Una tool nunca devuelve filas crudas.** `listarRegistrosDelMes` puede traer miles de filas; meterlas en el contexto es caro, lento y le da al modelo material para sumar mal. Cada tool agrega y devuelve un objeto chico.

Set mínimo propuesto (3 tools, admin, solo lectura):

| Tool | Envuelve | Devuelve |
|---|---|---|
| `resumen_mes` | `listarRegistrosDelMes` + `calcularKpisMensuales` + los rankings de `shared/utils/kpis/` | totales, cantidades por unidad, top labores, top trabajadores |
| `ausencias_rango` | `listarAsistenciaPorRango` | total, desglose por tipo, días por trabajador |
| `planilla_quincena` | `listarPagosQuincena` + `listarSalariosPorFinca` | total pagado, pagados vs pendientes, filas resumidas |

## Resolución de nombres: system prompt, no una tool

El usuario dice "Juan", no un UUID. En vez de una tool `buscar_trabajador`, inyectar en el system prompt las fincas activas y los trabajadores (`id`, `nombreCompleto`, `fincaId`). ~50 trabajadores ≈ 750 tokens — barato, y elimina una tool entera.

**Inyectar también la fecha de hoy**, con `shared/utils/fecha-local.ts` — nunca `toISOString()` (desde las 18:00 en CR devuelve el día siguiente). Sin la fecha, "este mes" no significa nada.

## Detalles del loop que rompen si se hacen mal

- **Todos los `tool_result` van en un único mensaje `user`.** Partirlos en varios le enseña al modelo a dejar de paralelizar.
- **Si un service tira, devolver el `tool_result` con `is_error: true`**, no descartarlo. Sin el bloque, el turno queda malformado.
- **Tope de iteraciones** (5), o un loop infinito quema tokens.

## Parámetros de la API

```ts
model: 'claude-opus-5'
max_tokens: 16000                  // en Opus 5 el thinking está prendido por default y cuenta contra max_tokens
output_config: { effort: 'low' }   // preguntas simples de datos; subir a 'medium' si elige mal la tool
```

Sin `temperature` / `top_p` — Opus 5 los rechaza con 400. Sin `thinking` explícito: adaptativo por default.

Dependencia nueva: `@anthropic-ai/sdk`. Es la única.

## Dev local

`pnpm dev` es Vite y **no sirve `api/`**. Para probar el proxy en local hace falta `vercel dev` (`pnpm add -g vercel` + `vercel link`).

`vercel.json` debería quedar así, para que el rewrite SPA no se coma `/api`:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

Los `rewrites` de Vercel corren después del chequeo de filesystem, así que `/api/chat` debería resolver igual. El negative lookahead cuesta cero y saca la duda.

## Ubicación en el repo

`features/chat` **headless**, hospedada por `admin/screens/ChatScreen.tsx` — el mismo patrón que `features/planilla` con `PlanillaScreen.tsx`. Ruta `/admin/chat` bajo `RouteGuard soloAdmin`, entrada en `NAV_ITEMS` de `AdminSidebar.tsx`.

`ChatInput.tsx` sería el primer `<textarea>` del repo. **La restricción de UX de baja alfabetización no aplica**: es `/admin/*`, no `features/captura`.

## Cómo verificar que no alucina

Cruzar cada respuesta contra la pantalla que ya muestra el dato:

- `resumen_mes` vs `/admin/dashboard-finca` del mismo mes → **tienen que coincidir exacto**. Si no, la agregación de la tool está mal.
- `ausencias_rango` vs `/admin/asistencia`.
- `planilla_quincena` vs `/admin/planilla`.
- Pregunta fuera de alcance ("¿cuál es el clima?") → debe decir que no puede, no inventar una tool.
- `curl -X POST /api/chat` sin `Authorization` → 401. Con token de supervisor → 403.

## Costo

Cada turno reenvía historial + resultados de tools. Una conversación de 3–4 preguntas ≈ 5–15k tokens de entrada. Con Opus 5 ($5/M entrada, $25/M salida) ronda **$0.05 por conversación**. Si escala, bajar a `claude-sonnet-5` es cambiar una constante.

## Fuera de alcance a propósito

Streaming · caché de prompt · chat para supervisor (choca con la UX de campo) · historial persistido · markdown/tablas en las respuestas · **tools de escritura** — el bot solo lee, el flujo supervisor→admin sigue siendo de un solo sentido.
