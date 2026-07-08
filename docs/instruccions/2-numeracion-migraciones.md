# 2. Numeracion de migraciones

TODA migracion Supabase empieza con numero consecutivo.

Regla real: Supabase CLI ya prefija cada migracion con timestamp (`supabase migration new <nombre>` -> `YYYYMMDDHHMMSS_nombre.sql`). Ese timestamp ES el numero consecutivo, orden de aplicacion = orden cronologico.

No renombrar archivos migracion a mano. No inventar numero propio (1_, 2_...) -> rompe orden real que usa el timestamp.

Flujo:
```bash
supabase migration new nombre_snake_case_espanol
```

Nombre: snake_case, espanol, descriptivo. No `migration1`, `cambios`, `fix`.
