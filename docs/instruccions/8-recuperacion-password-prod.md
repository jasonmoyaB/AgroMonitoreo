# 8. Flujo "olvidé mi contraseña" en producción (Vercel + Supabase)

Flujo vive en `src/features/auth/` (`ForgotPasswordScreen`, `ResetPasswordScreen`, `solicitarRecuperacionPassword`/`actualizarPassword` en `auth-service.ts`), rutas `/olvide-password` y `/reset-password`. `config.toml` solo aplica a `supabase start` local — nada de esto se replica solo al proyecto remoto, hay que setearlo a mano.

## Config que hubo que hacer (proyecto remoto, dashboard `gslahngbkmbblrqeehqj`)

1. **Auth → URL Configuration** (`.../auth/url-configuration`):
   - `Site URL`: `https://www.agromonitoreo.com`
   - `Redirect URLs`: `https://www.agromonitoreo.com/**`, `https://agromonitoreo.com/**`, `http://localhost:5173/**`
   - Dejar además `https://agromonitoreo.vercel.app/**` mientras haya links viejos circulando.
   - Sin esto, el link del correo cae fuera del allowlist y Supabase hace fallback silencioso a `Site URL` → si `Site URL` no estaba seteado (quedaba el default `127.0.0.1:3000`), el link rompe con "conexión rechazada"; si el fallback cae en `/` con sesión de recovery activa, redirige al dashboard (`/supervisor`) en vez de a `/reset-password`.

2. **Vercel → Environment Variables (Production)**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Vite las hornea en build time — si faltan, la app no explota al buildear, pega a Supabase vacío en runtime.

## Pendiente (bloquea "100% prod" real, no bloquea que el flujo básico funcione)

- ~~**Dominio propio**~~ — hecho: `agromonitoreo.com` comprado en Vercel. Canónica **`https://www.agromonitoreo.com`** (la web lleva `www`); el apex redirige. El correo es al revés: el sender es `no-responder@agromonitoreo.com`, **sin** `www`.
  La URL vive en 4 lugares que no se validan entre sí — `APP_URL` (secret de la edge function), `VITE_APP_URL` (Vercel), `Site URL` y `Redirect URLs`. Si uno queda viejo, Supabase no da error: el link cae fuera del allowlist y hace fallback silencioso al `Site URL`, y un invitado puede entrar sin haber definido contraseña.
- **Resend SMTP** (Auth → SMTP Settings): sin esto el email service default de Supabase tiene tope 2/hora, solo entrega a miembros del proyecto y tiene deliverability floja a Gmail. Config: host `smtp.resend.com`, port `465`, user `resend`, pass = API key de Resend, sender del dominio verificado. **Ahora también bloquea las invitaciones**, no solo la recuperación: los dos flujos salen por el mismo SMTP.
- **Rate limit** `email_sent` (Auth → Rate Limits): subir una vez Resend esté conectado. En `config.toml` ya está en 30 (eso es solo local).
- **`redirectTo` en `auth-service.ts`**: usa `import.meta.env.VITE_APP_URL`. Ya está en `.env.local`; **falta setearla en Vercel** (`https://www.agromonitoreo.com`, production y preview) o el link vuelve a caer al fallback roto descrito arriba. Cambiarla **exige redeploy**: Vite la hornea en build time.
  La edge function `invitar-usuario` usa lo mismo pero como secret suyo (`supabase secrets set APP_URL=...`, ya apuntando al dominio nuevo) — son dos lugares distintos, los dos hacen falta.

## Gotcha para la próxima vez que se toque

Cambios en `config.toml` (`[auth]`) solo pegan en local vía `supabase stop && supabase start`. Cambios que importan para prod van siempre por Dashboard del proyecto remoto, no por git.
