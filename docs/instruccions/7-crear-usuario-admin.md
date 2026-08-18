# 7. Crear un usuario admin_oficina

No se puede crear un usuario `admin_oficina` de cero — toda alta queda hardcodeada a `supervisor`, y desde `20260817164409` **sin finca** (`finca_id` null); ver `20260708183000_no_confiar_rol_metadata_signup.sql`. Es a propósito, para evitar escalación de privilegios vía metadata del cliente. A admin se **promueve**, siempre, y la finca se **asigna**, siempre.

Para promover un usuario existente a admin:

1. Un admin lo invita desde `/admin/supervisores` → botón **Invitar**; la persona recibe el correo y define su contraseña (queda como `supervisor`). El signup público está cerrado, no hay `/registro`.
2. **Camino normal**: editarlo en esa misma tabla de `/admin/supervisores` y cambiarle el rol a *Oficina*. El SQL de abajo solo hace falta para el **primer** admin, cuando todavía no hay ninguno que pueda invitar ni editar. Contra el proyecto (local con `supabase db reset` + Studio, o remoto vía SQL editor con `service_role`), correr:

```sql
update public.usuario
set rol_id = (select id from public.roles where nombre = 'admin_oficina')
where email = 'correo@delusuario.com';
```

3. La próxima vez que ese usuario inicie sesión, `AdminGuard` (`src/features/auth/components/AdminGuard.tsx`) lo deja entrar a `/admin/*`.

Este runbook manual sigue siendo intencional para el primer admin: la app es de un solo dueño y no hay signup self-serve. Del segundo en adelante, todo pasa por la UI.
