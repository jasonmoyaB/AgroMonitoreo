# 7. Crear un usuario admin_oficina

No se puede crear un usuario `admin_oficina` de cero — toda alta queda hardcodeada a `supervisor`, y desde `20260817164409` **sin finca** (`finca_id` null); ver `20260708183000_no_confiar_rol_metadata_signup.sql`. Es a propósito, para evitar escalación de privilegios vía metadata del cliente. A admin se **promueve**, siempre, y la finca se **asigna**, siempre.

Para promover un usuario existente a admin:

1. Un admin lo invita desde `/admin/supervisores` → botón **Invitar**; la persona recibe el correo y define su contraseña (queda como `supervisor`). El signup público está cerrado, no hay `/registro`.
2. **Camino normal**: editarlo en esa misma tabla de `/admin/supervisores` y cambiarle el rol a *Oficina*. El SQL de abajo solo hace falta para el **primer** admin, cuando todavía no hay ninguno que pueda invitar ni editar. Contra el proyecto (local con `supabase db reset` + Studio, o remoto vía SQL editor con `service_role`), correr:

```sql
begin;
  -- El claim NO es opcional. El trigger evitar_escalada_privilegios_usuario (20260715171832,
  -- restaurado en 20260803232810) corre tambien para `postgres`, y desde el SQL Editor no hay
  -- JWT: auth.uid() es null, private.es_admin_oficina() devuelve false, y la guarda toma la
  -- rama de "no sos admin" -> aborta con
  --   ERROR: No tienes permiso para modificar rol, finca o estado de tu cuenta.
  -- Poniendo el claim de un admin_oficina activo, la guarda pasa sola.
  set local request.jwt.claims = '{"sub":"<auth_user_id de un admin_oficina activo>"}';

  update public.usuario
     set rol_id = (select id from public.roles where nombre = 'admin_oficina')
   where email = 'correo@delusuario.com';
commit;
```

El `auth_user_id` sale de `select auth_user_id, email from public.usuario where email = '...'`.

**Huevo y gallina**: para el **primerísimo** admin de una base todavía no hay ningún
`admin_oficina` cuyo claim usar. Ese único caso se resuelve con el disable/enable del trigger,
igual que `supabase/seed.sql` (línea 104), y **dentro de una transacción** para que un fallo lo
restaure solo:

```sql
begin;
  alter table public.usuario disable trigger evitar_escalada_privilegios_usuario;
  update public.usuario
     set rol_id = (select id from public.roles where nombre = 'admin_oficina')
   where email = 'correo@delusuario.com';
  alter table public.usuario enable trigger evitar_escalada_privilegios_usuario;
commit;
```

Del segundo admin en adelante, usar el claim: no toma el `ACCESS EXCLUSIVE` sobre `usuario` ni
deja una guarda de escalada de privilegios apagada si algo se interrumpe.

Para dar de alta un **cliente nuevo** (organización propia + su primer admin), el runbook es
`docs/instruccions/10-alta-de-organizacion.md`, que ya incluye este mismo paso.

3. La próxima vez que ese usuario inicie sesión, `RouteGuard` con `soloAdmin` (`src/features/auth/components/RouteGuard.tsx`, decide vía `utils/decidir-acceso-ruta.ts`) lo deja entrar a `/admin/*`. No hay un `AdminGuard.tsx`: es el mismo componente con una prop.

Este runbook manual sigue siendo intencional para el primer admin: la app es de un solo dueño y no hay signup self-serve. Del segundo en adelante, todo pasa por la UI.
