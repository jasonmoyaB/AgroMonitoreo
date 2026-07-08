---
name: agrotrace-rules
description: Carga invariantes críticas del dominio AgroTrace antes de cualquier trabajo DB, SQL, migración o lógica de negocio. Previene violaciones de RLS, inmutabilidad, multi-tenant y convenciones del proyecto.
---

# Reglas de dominio AgroTrace

Invariantes **enforced en DB** (triggers + RLS). Violarlas rompe auditoría, trazabilidad o seguridad multi-tenant.

## 8 invariantes — todas obligatorias

### 1. Multi-tenant
```sql
organizacion_id UUID NOT NULL REFERENCES organizacion(id)
```
Toda tabla de negocio. Sin excepción.

### 2. RLS obligatorio
```sql
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... USING (organizacion_id = get_organizacion_actual());
```
Sin RLS + política = agujero multi-tenant.

### 3. Inmutabilidad de `aplicacion`
Trigger bloquea UPDATE en columnas de negocio. Para corregir: anular (`anulada = true`) + crear nueva. Nunca UPDATE directo en lógica de app.

### 4. Soft delete
Nunca `DELETE` físico. Usar `activo = false` (catálogo) o `anulado_en = now()` (eventos). Trazabilidad GlobalGAP lo exige.

### 5. Timestamps
`timestamptz` siempre. Nunca `timestamp`. La Trinidad opera en CR (UTC-6).

### 6. UUIDs como PKs
`DEFAULT gen_random_uuid()`. Nunca `SERIAL`/`BIGSERIAL` en tablas de negocio.

### 7. Idiomas
- SQL / esquema → **español**, snake_case (`aplicacion`, `ciclo_cultivo_id`)
- TypeScript / código → **inglés**, camelCase (`applicationId`, `cropCycle`)

### 8. Plazo seguridad = DAC/REI
Específico por `producto + cultivo`. Consultar `producto_cultivo` o snapshot en `aplicacion`. No asumir valores.

## Checklist rápido antes de cualquier migración

- [ ] `organizacion_id` en tabla nueva
- [ ] RLS habilitado + política creada
- [ ] Solo soft delete
- [ ] `timestamptz` en todos los timestamps
- [ ] UUID como PK
- [ ] Nombre SQL en español snake_case
- [ ] Verificar inmutabilidad si toca `aplicacion`

## Workflow migración

```bash
supabase migration new <nombre_español_snake_case>
# editar SQL
supabase db reset        # probar local (aplica migraciones + seeds)
pnpm db:types            # regenerar types/supabase.ts
```

## Docs
- Modelo completo: `docs/02-modelo-de-datos.md`
- Seguridad / RLS: `docs/07-seguridad.md`
- Roles y permisos: `docs/08-roles-y-permisos.md`
- PRD procesos: `docs/09-prd-procesos.md`
