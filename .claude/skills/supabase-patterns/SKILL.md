---
name: supabase-patterns
description: Use when writing Supabase queries, RLS policies, migrations, edge functions, or wiring Supabase into React — enforces multi-tenant safety, correct client usage, and production-grade patterns.
---

# Supabase Patterns

## Non-Negotiables

1. **Nunca `SELECT *`** — siempre listar columnas. Evita over-fetching y rompe menos cuando cambia el schema.
2. **Toda tabla de negocio lleva `organizacion_id`** — es el pilar del multi-tenant.
3. **RLS habilitado desde el momento de CREATE TABLE**, no después.
4. **`service_role_key` nunca en el frontend** — solo en Edge Functions o scripts admin.
5. **Soft delete siempre** — `UPDATE SET activo = false`, nunca `DELETE`.
6. **Nunca editar una migración ya aplicada** — crear una nueva.

---

## Cliente Supabase

### Un solo cliente por contexto (singleton)

```ts
// packages/shared/src/supabase-client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- **Frontend / React:** `anon key` + RLS. Importar desde el singleton, nunca crear `createClient` en un componente.
- **Edge Functions (Deno):** `service_role_key` para operaciones admin, o `createClient` con el JWT del usuario para mantener RLS.
- **Scripts admin:** `service_role_key` solo en entorno servidor/CI, nunca expuesto al cliente.

---

## RLS — Row Level Security

### Estructura base para tabla multi-tenant

```sql
-- 1. Habilitar en el mismo CREATE
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;

-- 2. Política SELECT — usa get_organizacion_actual(), no auth.uid() directo
CREATE POLICY "aplicaciones_select" ON aplicaciones
  FOR SELECT USING (
    organizacion_id = get_organizacion_actual()
  );

-- 3. Política INSERT — garantiza que inserten en su propia org
CREATE POLICY "aplicaciones_insert" ON aplicaciones
  FOR INSERT WITH CHECK (
    organizacion_id = get_organizacion_actual()
  );

-- 4. No permitir UPDATE/DELETE si la tabla es inmutable (ej: aplicaciones)
-- Si la tabla sí permite updates:
CREATE POLICY "aplicaciones_update" ON aplicaciones
  FOR UPDATE USING (
    organizacion_id = get_organizacion_actual()
  );
```

### Reglas para escribir policies

- Siempre `get_organizacion_actual()` para multi-tenant — no `auth.uid()` directo.
- Una policy por operación (SELECT, INSERT, UPDATE, DELETE) — más legible.
- Si una tabla es de solo lectura pública (ej: catálogo), usar `FOR SELECT USING (true)`.
- Probar con `SET LOCAL role = authenticated; SET LOCAL request.jwt.claims = '...'` en tests.

---

## Queries — PostgREST

### Selección de columnas (nunca `*`)

```ts
// ❌
const { data } = await supabase.from('aplicaciones').select('*')

// ✅ — columnas explícitas + join tipado
const { data } = await supabase
  .from('aplicaciones')
  .select('id, fecha, tipo, dosis, producto:productos(id, nombre_comercial)')
  .eq('finca_id', fincaId)
  .eq('activo', true)
  .order('fecha', { ascending: false })
```

### Manejo de errores en el service (nunca ignorar `error`)

```ts
export async function fetchAplicaciones(fincaId: string): Promise<Aplicacion[]> {
  const { data, error } = await supabase
    .from('aplicaciones')
    .select('id, fecha, tipo, dosis')
    .eq('finca_id', fincaId)
    .eq('activo', true)

  if (error) throw new Error(`fetchAplicaciones: ${error.message}`)
  return data
}
```

### Paginación

```ts
const { data, count } = await supabase
  .from('aplicaciones')
  .select('id, fecha', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

---

## RPC — cuándo usar funciones Postgres

Usar RPC en vez de PostgREST cuando:
- La operación requiere lógica transaccional (múltiples tablas).
- Necesitás bypasear RLS de forma controlada (`SECURITY DEFINER`).
- El query tiene lógica compleja que no expresás limpiamente con el builder.
- Operaciones de auditoría o eventos que deben ser atómicos.

```ts
// Llamada RPC tipada
const { data, error } = await supabase
  .rpc('registrar_aplicacion', {
    p_finca_id: fincaId,
    p_tipo: tipo,
    p_dosis: dosis,
  })
```

```sql
-- Función con SECURITY INVOKER (respeta RLS del usuario)
CREATE OR REPLACE FUNCTION registrar_aplicacion(
  p_finca_id UUID,
  p_tipo TEXT,
  p_dosis NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER  -- nunca SECURITY DEFINER sin justificación
AS $$
BEGIN
  -- lógica transaccional aquí
END;
$$;
```

---

## Migraciones

### Una migración = un cambio atómico

```sql
-- supabase/migrations/20240601_agrega_tabla_productos.sql
BEGIN;

CREATE TABLE productos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id),
  nombre_comercial TEXT NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_select" ON productos
  FOR SELECT USING (organizacion_id = get_organizacion_actual());

COMMIT;
```

### Reglas de migraciones

- **Siempre `BEGIN / COMMIT`** cuando hay cambios de datos.
- **Nunca editar un archivo de migración ya aplicado** — crear uno nuevo.
- **Nombres descriptivos:** `20240601_agrega_tabla_X`, `20240602_agrega_columna_Y_a_X`.
- **Soft delete:** nunca `DROP COLUMN` en producción sin período de deprecación.
- Para cambios destructivos, usar `ALTER TABLE ... RENAME COLUMN` + migración de datos + `DROP` en migración separada posterior.

---

## Tipos TypeScript

### Regenerar después de cada migración

```bash
pnpm db:types
# equivale a:
# supabase gen types typescript --linked > packages/shared/src/types/supabase.ts
```

### Usar los tipos generados en servicios

```ts
import type { Database } from '@agrotrace/shared/types/supabase'

type Aplicacion = Database['public']['Tables']['aplicaciones']['Row']
type AplicacionInsert = Database['public']['Tables']['aplicaciones']['Insert']
```

**Nunca definir interfaces manualmente para tablas Supabase** — los tipos generados son la fuente de verdad.

---

## Realtime

Usar solo cuando la UI necesita actualizaciones en vivo sin polling. Costo: conexión websocket permanente.

```ts
// hooks/use-aplicaciones-realtime.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAplicacionesRealtime(fincaId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`aplicaciones:${fincaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'aplicaciones', filter: `finca_id=eq.${fincaId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['aplicaciones', fincaId] })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fincaId, queryClient])
}
```

**Patrón:** Realtime invalida la query de TanStack Query — no actualiza estado local directamente.

---

## Storage

```ts
// Upload con path organizado por org (evita colisiones entre tenants)
const path = `${organizacionId}/${fincaId}/${fileName}`

const { error } = await supabase.storage
  .from('documentos')
  .upload(path, file, { upsert: false })

// URL pública (solo si el bucket es público)
const { data } = supabase.storage.from('documentos').getPublicUrl(path)

// URL firmada para buckets privados (expira)
const { data } = await supabase.storage
  .from('documentos')
  .createSignedUrl(path, 3600) // 1 hora
```

**Regla:** path siempre empieza con `organizacion_id` — aislamiento de datos entre tenants.

---

## Edge Functions

```ts
// supabase/functions/nombre-funcion/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Crear cliente con el JWT del usuario (mantiene RLS)
  const authHeader = req.headers.get('Authorization')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )

  // Para operaciones admin: usar SUPABASE_SERVICE_ROLE_KEY
  // Solo cuando es estrictamente necesario bypasear RLS

  const body = await req.json()
  // ... lógica

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## Patrón en React (service → hook → component)

```
supabase client
    ↓
aplicacion-service.ts   ← query con columnas explícitas + error handling
    ↓
use-aplicacion-list.ts  ← useQuery de TanStack Query
    ↓
AplicacionList.tsx      ← solo render
```

**TanStack Query es el estado del servidor** — no duplicar datos en Zustand.

---

## NUNCA hacer

- ❌ `SELECT *` — siempre columnas explícitas
- ❌ Crear `createClient` dentro de un componente o hook
- ❌ `service_role_key` en código frontend o variables de entorno del cliente
- ❌ RLS deshabilitado en tabla con datos de usuarios
- ❌ Policy RLS con `auth.uid()` directo en proyecto multi-tenant (usar `get_organizacion_actual()`)
- ❌ `DELETE` físico — soft delete con `activo = false`
- ❌ Editar migración ya aplicada — crear una nueva
- ❌ Interfaces TypeScript manuales para tablas — usar tipos generados
- ❌ Ignorar el campo `error` del resultado de una query
- ❌ Actualizar estado local desde Realtime — invalidar la query de TanStack Query
