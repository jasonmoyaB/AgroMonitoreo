---
name: search-first
description: Prevents duplicate code in AgroTrace by forcing a codebase search before implementing anything. Knows the project's existing query keys, hooks, services, and patterns. Activates before any new hook, component, service, or util is created.
---

# Search First — No Duplicate Code

## Regla absoluta

**Antes de escribir una sola línea, buscá si ya existe.**

Crear algo que ya existe es el error más caro. Este skill obliga a buscar primero.

---

## Paso 1 — Buscar antes de crear

Para cualquier tarea de implementación, corré estas búsquedas **antes de abrir un archivo nuevo**:

```bash
# ¿Ya existe un hook para esto?
grep -r "useNombre\|useCosa" apps/web/src/hooks/

# ¿Ya hay una query function para esto?
grep -r "listar\|obtener\|crear\|registrar\|actualizar" apps/web/src/lib/queries/

# ¿Ya existe un query key?
grep -r "qk\." apps/web/src/lib/queries/keys.ts

# ¿Ya hay un componente similar?
grep -r "ComponenteName\|cosa" apps/web/src/components/
```

Si encontrás algo → usalo o extendelo. No copies, no reimplementes.

---

## Mapa de lo que ya existe

### Query keys (`qk.*`)

Definidos en `apps/web/src/lib/queries/keys.ts`. Antes de usar una string de query key hardcodeada, verificá si `qk` ya tiene la key:

```
qk.bodega.existencias()
qk.bodega.movimientos()
qk.bodega.empleados()
qk.bodega.proveedores()
qk.bodega.porVencer()
qk.catalogo.autorizacion(productoId)
qk.catalogo.cultivos()
qk.catalogo.producto(productoId)
```

**Nunca** uses `['bodega', 'algo']` directo — buscá en `keys.ts` primero.

### Query functions (`apps/web/src/lib/queries/`)

| Función | Archivo |
|---------|---------|
| `registrarMovimiento` | `index.ts` |
| `subirDocumentoCompra` | `index.ts` |
| `verificarAutorizacionCatalogo` | `index.ts` |
| `listarEmpleados` | `index.ts` |
| `listarProveedores` | `index.ts` |
| `listarCultivosActivos` | `index.ts` |
| `obtenerProductoPorId` | `catalogo.ts` |

Antes de escribir una nueva llamada a Supabase, buscá si ya existe en `apps/web/src/lib/queries/`.

### Hooks existentes (`apps/web/src/hooks/`)

| Hook | Qué hace |
|------|----------|
| `useRegistrarMovimientoModal` | Form state + mutation para movimientos |
| `useMovimientoQueries` | Queries de empleados, cultivos, proveedores, catálogo |
| `useBodegaData` | Datos principales de la bodega activa |
| `useBodegaDashboard` | Dashboard agregado de bodega |
| `useProyeccionAgotamiento` | Proyección de stock |
| `useProveedorPrecioVigente` | Precio vigente por proveedor+producto |

### Shared (`packages/shared/`)

- `movimientoInventarioInputSchema` — schema Zod para validar movimientos
- `uuidv7` — generador de IDs
- Tipos generados de Supabase en `types/supabase.ts`

---

## Paso 2 — Decidir si extender o crear

| Situación | Acción |
|-----------|--------|
| Existe exactamente lo que necesito | Usalo. No toques nada más. |
| Existe algo parecido con 80% de overlap | Extendelo con un parámetro opcional o un nuevo retorno. |
| Existe pero en la capa equivocada | Movelo a la capa correcta, no lo dupliques. |
| No existe nada similar | Recién ahora creá un archivo nuevo. |

---

## Paso 3 — Si tenés que crear algo nuevo

Seguí la estructura existente del proyecto:

```
apps/web/src/
  hooks/         → use-nombre-cosa.ts   (camelCase en el export)
  lib/queries/   → agregar fn al archivo correcto, agregar key a keys.ts
  components/
    bodega/      → componentes de bodega
    catalogo/    → componentes de catálogo
```

Convenciones:
- SQL / Supabase: **español**, snake_case
- TypeScript: **inglés**, camelCase
- Query keys: siempre vía `qk.*`, nunca strings hardcodeadas
- UUIDs: siempre `uuidv7()` del shared
- Validación: siempre `zod` antes de enviar a Supabase

---

## Checklist antes de entregar

- [ ] Busqué en `hooks/` si ya hay un hook para esto
- [ ] Busqué en `lib/queries/` si ya hay una función de acceso a datos
- [ ] Revisé `keys.ts` antes de usar una query key
- [ ] No hay strings hardcodeadas de query keys (`['bodega', ...]`)
- [ ] No copié lógica que ya está en otro archivo
- [ ] Usé `uuidv7()` del shared (no `crypto.randomUUID()`)
- [ ] Validé con el schema Zod correcto antes de mutar
