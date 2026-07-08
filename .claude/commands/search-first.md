---
description: Busca en el codebase de AgroTrace si ya existe lo que querés implementar antes de crear código nuevo.
argument-hint: qué querés implementar (ej: "hook para listar proveedores", "query de existencias")
---

Antes de implementar `$ARGUMENTS`, buscá si ya existe en el codebase.

## Búsqueda

1. Leer `apps/web/src/lib/queries/keys.ts` — ver query keys existentes (`qk.*`)
2. Leer `apps/web/src/lib/queries/index.ts` — ver funciones de acceso a datos
3. Buscar en `apps/web/src/hooks/` hooks relacionados con el tema
4. Buscar en `apps/web/src/components/` componentes similares

## Salida requerida

Responder en este formato exacto:

### ¿Ya existe?

| Qué | Dónde | Estado |
|-----|-------|--------|
| [cosa encontrada] | [archivo:línea] | ✅ Existe / ⚠️ Parcial / ❌ No existe |

### Recomendación

- **Si existe:** usá `[nombre]` de `[archivo]`. No crear nada nuevo.
- **Si es parcial:** extender `[nombre]` agregando `[qué]`. No duplicar.
- **Si no existe:** recién ahora crear. Seguir estructura en `apps/web/src/hooks/` o `apps/web/src/lib/queries/`.

### Convenciones a respetar si creás algo nuevo

- Query key: agregar a `keys.ts` como `qk.[dominio].[nombre]()`
- Hook: `apps/web/src/hooks/use-nombre-cosa.ts`
- Query fn: agregar al archivo correcto en `apps/web/src/lib/queries/`
- UUID: `uuidv7()` del shared, nunca `crypto.randomUUID()`
- Validación: schema Zod antes de cualquier mutación
