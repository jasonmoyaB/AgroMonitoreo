---
name: senior-dev
description: Use when creating new files, implementing features, or writing any code — enforces SOLID principles, layered architecture, and clean code from a 20+ year engineering perspective. Never puts everything in one file. Activates before any implementation task.
---

# Senior Dev — Engineering Standards

## Los Non-Negotiables (nunca se negocian)

1. **Un archivo = una responsabilidad.** Si hace dos cosas, son dos archivos.
2. **Presentación ≠ lógica de negocio ≠ acceso a datos.** Siempre en capas separadas.
3. **Si lo escribís dos veces, abstraelo. Si lo escribís tres, es código compartido.**
4. **Menos código = mejor código.** La mejor línea es la que no existe.
5. **El nombre es el comentario.** Si necesitás explicar QUÉ hace algo, renombralo.

---

## Antes de crear cualquier archivo

Respondé estas preguntas. Si alguna falla, no abras el archivo todavía:

- ¿Ya existe algo que haga esto? (buscá antes de crear)
- ¿Este archivo tiene una responsabilidad clara y única?
- ¿El nombre describe exactamente qué hace, sin ambigüedad?
- ¿La lógica pertenece a esta capa de la arquitectura?

---

## Arquitectura por capas

### React / TypeScript / Frontend

```
components/     → UI pura. Sin fetch. Sin lógica de negocio. Solo render.
hooks/          → Lógica, estado, efectos secundarios. Sin JSX.
services/       → Llamadas a API / Supabase. Sin estado. Sin UI.
utils/          → Funciones puras. Sin efectos. Sin imports de framework.
types/          → Interfaces y tipos. Sin lógica.
constants/      → Magic values. Sin funciones.
stores/         → Estado global (Zustand). Sin UI.
```

**Flujo de dependencias (nunca al revés):**
```
components → hooks → services → utils
components → stores
components → types / constants
```

Un componente no importa de otro componente de otra feature directamente.

### Python / Backend

```
routes/          → HTTP layer. Recibe request, llama servicio, devuelve response.
services/        → Lógica de negocio. No sabe de HTTP ni de DB directamente.
repositories/    → Solo queries. Sin lógica de negocio.
schemas/         → Validación con Pydantic. Sin efectos secundarios.
utils/           → Funciones puras auxiliares.
config/          → Variables de entorno. Sin lógica.
```

### Supabase / SQL

```
migrations/      → Un cambio atómico por archivo. Nunca editar una migración aplicada.
functions/       → Una edge function = una responsabilidad.
types/           → Generados automáticamente. No editar a mano.
```

---

## Límites de tamaño (reglas duras)

En proyectos grandes y escalables, el foco no está en el mínimo, sino en el máximo. La regla general para mantener la legibilidad es: máximo 100-150 líneas por archivo de componente. Si un archivo supera las 150 líneas, es una señal clara de que debés romperlo en subcomponentes, hooks personalizados o archivos de utilidad independientes.

| Qué | Límite | Qué hacer si superás |
|-----|--------|----------------------|
| Líneas por archivo | 150 | Dividir en archivos |
| Líneas por función | 30 | Extraer subfunciones |
| Parámetros por función | 3 | Objeto / dataclass |
| Niveles de indentación | 3 | Early return / extraer |
| Props por componente | 5 | Agrupar en objeto o dividir componente |

---

## Naming — el código habla por sí solo

| Qué | Patrón | Ejemplo |
|-----|--------|---------|
| Componente React | PascalCase sustantivo | `ProductoCard`, `BodegaTable` |
| Hook | `use` + sustantivo | `useProductoDetalle`, `useFincaList` |
| Service fn | verbo + sustantivo | `fetchAplicaciones`, `createCiclo` |
| Util fn | verbo descriptivo | `formatFecha`, `calcularPlazo` |
| Constante | UPPER_SNAKE_CASE | `MAX_CICLOS_ACTIVOS` |
| Tipo / Interface | PascalCase | `Aplicacion`, `CicloActivo` |
| Archivo componente | kebab-case | `producto-card.tsx` |
| Archivo hook | kebab-case | `use-producto-detalle.ts` |

---

## SOLID — aplicado, no teórico

**S — Una responsabilidad:**
- Componente hace fetch → mover lógica a hook
- Función valida Y transforma → dividir en dos funciones
- Service hace lógica Y queries → separar en service + repository

**O — Abierto para extensión, cerrado para modificación:**
- Nunca `switch/if` sobre tipos para decidir comportamiento → map de handlers
- Agregar soporte para nuevo caso sin tocar código existente

**L — Liskov:**
- Composición sobre herencia
- Un componente hijo no puede romper la API del padre

**I — Interfaces pequeñas:**
- Props: solo los campos que ese componente usa, nada más
- Nunca pasar el objeto entero si solo necesitás 2 campos: `{ id, nombre }` no `usuario`

**D — Inversión de dependencias:**
- Componentes reciben datos como props, no los fetchean internamente
- Services reciben cliente como parámetro, no lo crean internamente

---

## Patrones de estructura para features nuevas

### Feature React completa

```
feature-name/
  components/
    FeatureList.tsx          ← render list
    FeatureCard.tsx          ← render item
    FeatureForm.tsx          ← form UI
  hooks/
    use-feature-list.ts      ← fetch + state para la lista
    use-feature-form.ts      ← form state + submit
  services/
    feature-service.ts       ← queries Supabase
  types/
    feature.types.ts         ← interfaces
  constants/
    feature.constants.ts     ← valores fijos
  index.ts                   ← solo re-exports públicos
```

### Endpoint Python nuevo

```
routes/feature.py            ← solo HTTP, sin lógica
services/feature_service.py  ← lógica de negocio
repositories/feature_repo.py ← queries
schemas/feature_schema.py    ← validación Pydantic
```

---

## NUNCA hacer

- ❌ Todo el código de una feature en un solo archivo
- ❌ Lógica de negocio dentro de un componente React
- ❌ `fetch` / query Supabase directo en un componente (va en hook o service)
- ❌ `any` en TypeScript — usá `unknown` + type guard si no sabés el tipo
- ❌ Magic numbers o strings sin constante nombrada
- ❌ Comentarios que explican QUÉ hace el código (renombrá en su lugar)
- ❌ Función de más de 30 líneas sin extraer
- ❌ Más de 3 niveles de indentación — usá early return
- ❌ Copiar y pegar código — si lo pegás, abstraelo
- ❌ `index.ts` con lógica — solo re-exports

---

## Checklist antes de entregar código

- [ ] ¿Cada archivo tiene una sola responsabilidad?
- [ ] ¿La lógica está en la capa correcta (no en el componente, no en el tipo)?
- [ ] ¿Alguna lógica duplicada? → extraer a util o servicio compartido
- [ ] ¿Todos los nombres describen exactamente qué hace sin necesitar comentario?
- [ ] ¿No hay `any`? ¿Los tipos están definidos?
- [ ] ¿Ningún archivo supera las 150 líneas?
- [ ] ¿Ninguna función supera las 30 líneas?
- [ ] ¿Existe ya una utilidad que haga esto? (evitar reimplementar)

---

## Criterio de corrección

**El código está correcto cuando pasa estas dos pruebas. Sin excepción:**

```bash
pnpm typecheck     # sin errores de tipos en ningún workspace
supabase db reset  # migraciones + seeds aplican sin error
```

- Typecheck falla → código incompleto. No entregar.
- `db reset` falla → migración rota o seed inválido. No entregar.
- Si no podés correr `db reset` localmente, documentá el bloqueo antes de hacer PR.
