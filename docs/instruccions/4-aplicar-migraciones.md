# 4. Aplicar migraciones a Supabase

Para llevar las migraciones locales (`supabase/migrations/*.sql`) al proyecto Supabase remoto:

```bash
supabase db push
```

No usar `supabase db reset` contra el proyecto remoto (esa borra y recrea la base). `db reset` es solo para validar migraciones en local con Docker corriendo.

Antes de correr `db push`, revisar que el proyecto remoto esté linkeado (`supabase link`) y que no haya migraciones sin commitear que no deberían aplicarse todavía.
