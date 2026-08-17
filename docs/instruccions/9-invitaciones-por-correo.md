# 9. Invitaciones por correo (alta de usuarios)

El signup público está cerrado. La única forma de que exista un usuario nuevo es que un `admin_oficina` lo invite desde `/admin/supervisores` → botón **Invitar**.

Flujo completo: admin escribe el correo → edge function `invitar-usuario` (tiene el `service_role`) llama `auth.admin.inviteUserByEmail` → Supabase manda el correo por SMTP → el link cae en `/reset-password?invitacion=1` → la persona define su contraseña y entra como `supervisor` **sin finca asignada** (ve la pantalla "Todavía no tienes finca", no la app). El admin le asigna la finca desde `/admin/supervisores` — la fila aparece con el badge ámbar "Sin finca". Para volverla oficina, se le cambia el rol en esa misma tabla.

## Config de una sola vez (Dashboard remoto, no va por git)

1. **Project Settings → Authentication → SMTP Settings** → *Enable Custom SMTP* (Resend): host `smtp.resend.com`, port `465`, user `resend`, pass = API key de Resend (`re_...`, permiso *Sending access*), sender name `AgroMonitoreo`.
   Sin esto el email service default de Supabase topa en **2/hora**, solo entrega a miembros del proyecto **y deja los templates de solo lectura** — el editor aparece gris con *"Set up custom SMTP to edit templates"*. Es antiphishing de Supabase, no un límite de plan: el plan Free permite todo esto. (Lo que sí exige Pro es `auth_leaked_password_protection`, ver `docs/contexto/decisiones.md` 12c.)

   **Sender**: `no-responder@agromonitoreo.com` — sin `www`, los remitentes de correo nunca lo llevan (la web sí: `https://www.agromonitoreo.com`). Requiere el dominio verificado en **Resend → Domains**. Ya está hecho; los 4 registros viven en Vercel → Settings → Domains → DNS, con el *Name* **relativo** (`send`, no `send.agromonitoreo.com`):

   | Name | Tipo | Valor |
   |---|---|---|
   | `resend._domainkey` | TXT | DKIM (`p=MIGf…IDAQAB`) |
   | `send` | TXT | `v=spf1 include:amazonses.com ~all` |
   | `send` | MX (prio 10) | `feedback-smtp.us-east-1.amazonses.com` |
   | `_dmarc` | TXT | `v=DMARC1; p=none;` |

   Resend **no** los inserta solo aunque detecte "Provider: Vercel" — hay que pegarlos a mano. Verificarlos sin depender de la UI: `nslookup -type=TXT resend._domainkey.agromonitoreo.com 8.8.8.8`.

   Mientras el dominio no esté **Verified**, el sender tiene que ser `onboarding@resend.dev`, y con ese Resend **solo entrega a la casilla dueña de la cuenta**: a cualquier otro destinatario lo rechaza con `550 "You can only send testing emails to your own email address"`. Ese rechazo llega como **502**, no como 400.

   Ojo con el orden: verificar el dominio **no** cambia el sender. Si después de verificar el envío sigue fallando con ese mismo 550, es que el campo *Sender email* de Supabase quedó en `onboarding@resend.dev` — pasó exactamente eso acá. El síntoma es idéntico antes y después de verificar; lo único que lo distingue es mirar ese campo.

   Para reprobar contra tu propio correo: como ya tiene cuenta, la función responde `Ese correo ya tiene cuenta.` — borrá ese usuario en **Auth → Users** y reinvitá. Los alias `+algo` de Gmail no sirven de atajo: Resend compara contra el correo exacto de la cuenta.
2. **Auth → Rate Limits** → `email_sent`: subir a ~30/h.
3. **Auth → Sign In / Providers → Email**: apagar *"Allow new users to sign up"*.
   Esto es el control de acceso real. Borrar la pantalla de registro no cierra `POST /auth/v1/signup`.
4. **Auth → URL Configuration**: `Site URL` = `https://www.agromonitoreo.com`; `Redirect URLs` = `https://www.agromonitoreo.com/**`, `https://agromonitoreo.com/**`, `http://localhost:5173/**` (+ `https://agromonitoreo.vercel.app/**` mientras circulen links viejos).
5. **Auth → Email Templates → Invite user**: subject `Te dieron acceso a AgroMonitoreo`, cuerpo = contenido de `supabase/templates/invitacion.html` pegado tal cual.
   Ese archivo es la fuente de verdad versionada; si alguien edita la plantilla en el Dashboard, hay que actualizarlo también o se desincronizan sin aviso.
   **No uses `supabase config push`** para sincronizarla: empuja todo el bloque `[auth]` de `config.toml`, incluido `site_url = "http://127.0.0.1:3000"`, y te deja el Site URL de producción apuntando a localhost.
   El pie *"powered by Supabase · Opt out of these emails"* y el remitente `noreply@mail.app.supabase.io` no salen de la plantilla: son del email service default. Desaparecen solo al conectar el SMTP del paso 1.
   Este paso **va después del 1**, no antes: sin SMTP el editor está bloqueado.

## Deploy de la función

```bash
supabase functions deploy invitar-usuario
supabase secrets set APP_URL=https://www.agromonitoreo.com
```

`APP_URL` es obligatorio: sin él la función responde 500 a propósito. Si el link cayera al `Site URL`, el invitado entraría con sesión activa a `/` **sin haber definido contraseña nunca**.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` las inyecta el runtime solo — no se setean a mano y no salen de Supabase.

## Probar en local

```bash
supabase start
supabase functions serve invitar-usuario --env-file supabase/functions/.env   # APP_URL=http://localhost:5173
```

Los correos locales no salen a internet: caen en Inbucket, `http://127.0.0.1:54324`.

Las dos pruebas que importan:

- Invocar la función con el JWT de un **supervisor** → 403. Con el de un **admin_oficina** → 200. `verify_jwt` sola no alcanza: un supervisor también tiene un JWT válido, el chequeo de rol está dentro de la función.
- `curl -X POST .../auth/v1/signup` → debe fallar, en local y en remoto.

## Qué significa cada status

| Status | Causa |
|---|---|
| `404` en el `OPTIONS` | la función no está deployada en ese proyecto |
| `401` | falta el header `Authorization` (lo corta el gateway, no la función) |
| `403` | el que llama no es `admin_oficina` activo |
| `400` | dato malo: correo inválido, o correo ya registrado |
| `500` | falta el secret `APP_URL` |
| `502` | el correo era válido pero el SMTP rechazó el envío |

La separación 400 / 502 es deliberada. Antes todo fallo de `inviteUserByEmail` devolvía 400, y un rechazo del SMTP quedaba indistinguible de un correo mal escrito: el log del edge decía `POST | 400` y el motivo real solo aparecía en los **auth logs**, no en los de la función.

Si algo falla y el mensaje en pantalla no alcanza, el motivo crudo está en los auth logs:

```sql
select timestamp, event_message from logs
where source = 'auth_logs' and event_message ilike '%invite%'
order by timestamp desc limit 10;
```

Ahí salió, por ejemplo: `gomail: could not send email 1: 550 "You can only send testing emails to your own email address..."` — Resend en modo prueba rechazando un destinatario que no era el dueño de la cuenta.

Dato tranquilizador comprobado: cuando el envío falla, GoTrue **revierte** la creación del usuario. No quedan filas huérfanas en `auth.users` ni en `public.usuario`, aunque los auth logs muestren un `user_invited` con su `user_id` (es la transacción abortada).

## Gotchas

- `functions.invoke()` no lee el cuerpo cuando el status no es 2xx; el mensaje real viaja en `error.context`. Por eso `supervisores-service.ts` tiene `leerMensajeFuncion`.
- `VITE_APP_URL` (front, para la recuperación de contraseña) y el secret `APP_URL` (edge function, para la invitación) son **dos lugares distintos**. Los dos hacen falta, y en Vercel hay que setear la primera para production y preview.
- La fila de `usuario` se crea **al invitar**, no cuando la persona acepta: `inviteUserByEmail` inserta en `auth.users` y ahí dispara `crear_usuario_desde_auth()`. Por eso `use-invitar-usuario.ts` invalida `SUPERVISORES_QUERY_KEY` — sin eso el admin no ve al invitado, reinvita y come "Ese correo ya tiene cuenta".
