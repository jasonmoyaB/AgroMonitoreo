---
description: Crea nueva migración Supabase con el workflow correcto del proyecto
argument-hint: nombre_en_snake_case_español (ej: agregar_campo_lote, fix_rls_bodega)
---

Crea una nueva migración de Supabase respetando las convenciones del proyecto.

## Pasos obligatorios

1. Crear: `supabase migration new $ARGUMENTS`
2. Abrir el archivo SQL recién creado en `supabase/migrations/`
3. Escribir/aplicar el cambio solicitado
4. Recordar al usuario: `supabase db reset` → `pnpm db:types`

## Convenciones de nombre

- snake_case, español, descriptivo del cambio
- ✅ `agregar_campo_volumen_lote`, `fix_rls_bodega_capataz`, `nueva_tabla_herramienta`
- ❌ `migration1`, `cambios`, `update_db`, `fix`

## Reglas críticas antes de escribir SQL

- **Nunca editar** migración ya aplicada (crea una nueva)
- Toda tabla nueva requiere: `organizacion_id`, `ENABLE ROW LEVEL SECURITY`, política con `get_organizacion_actual()`
- Soft delete: `activo = false` o `anulado_en`, nunca `DELETE` físico
- `timestamptz` siempre, nunca `timestamp`
- UUID como PK: `DEFAULT gen_random_uuid()`
- Nombres SQL en español, snake_case

## Si $ARGUMENTS está vacío

Pedir al usuario el nombre antes de crear.

## Al terminar

Recordar siempre:
```
supabase db reset    # local
pnpm db:types        # regenera packages/shared/src/types/supabase.ts
```
