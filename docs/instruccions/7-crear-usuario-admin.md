# 7. Crear un usuario admin_oficina

No existe signup ni UI para crear un usuario con rol `admin_oficina` — todo signup queda hardcodeado a `supervisor` + `birrisito` (ver `20260708183000_no_confiar_rol_metadata_signup.sql`), a propósito, para evitar escalación de privilegios vía metadata del cliente.

Para promover un usuario existente a admin:

1. La persona se registra normal desde `/registro` (queda como `supervisor`).
2. Contra el proyecto (local con `supabase db reset` + Studio, o remoto vía SQL editor con `service_role`), correr:

```sql
update public.usuario
set rol_id = (select id from public.roles where nombre = 'admin_oficina')
where email = 'correo@delusuario.com';
```

3. La próxima vez que ese usuario inicie sesión, `AdminGuard` (`src/features/auth/components/AdminGuard.tsx`) lo deja entrar a `/admin/*`.

Este runbook manual es intencional: la app es de un solo admin/dueño, no hace falta un flujo de invitación self-serve todavía.
