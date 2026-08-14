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

## Estado: cerrado (2026-08-13)

Todo lo que estaba pendiente quedó hecho. Se deja el detalle porque es la config que hay que rehacer si se cambia de dominio o de proveedor de correo.

- **Dominio propio**: `agromonitoreo.com` comprado en Vercel. Canónica **`https://www.agromonitoreo.com`** (la web lleva `www`); el apex redirige. El correo es al revés: el sender es `no-responder@agromonitoreo.com`, **sin** `www`.
  La URL vive en 4 lugares que no se validan entre sí — `APP_URL` (secret de la edge function), `VITE_APP_URL` (Vercel), `Site URL` y `Redirect URLs`. Si uno queda viejo, Supabase no da error: el link cae fuera del allowlist y hace fallback silencioso al `Site URL`, y un invitado puede entrar sin haber definido contraseña.
- **Resend SMTP** (Auth → SMTP Settings): host `smtp.resend.com`, port `465`, user `resend`, pass = API key de Resend, sender `no-responder@agromonitoreo.com` sobre el dominio verificado en Resend → Domains. Sin esto el email service default de Supabase tiene tope 2/hora, solo entrega a miembros del proyecto, tiene deliverability floja a Gmail y deja los templates de solo lectura. Cubre los dos flujos: recuperación **e** invitaciones.
- **Rate limit** `email_sent` (Auth → Rate Limits): en 30/h. En `config.toml` también, pero eso es solo local.
- **`redirectTo` en `auth-service.ts`**: usa `import.meta.env.VITE_APP_URL`, seteada en Vercel (production y preview) a `https://www.agromonitoreo.com`. Cambiarla **exige redeploy**: Vite la hornea en build time. Verificable sin adivinar — bajar el bundle de prod y buscar la URL:
  ```bash
  curl -s https://www.agromonitoreo.com/assets/index-*.js | grep -o 'https://[a-z0-9.-]*agromonitoreo[a-z.]*' | sort -u
  ```
  La edge function `invitar-usuario` usa lo mismo pero como secret suyo (`supabase secrets set APP_URL=...`) — son dos lugares distintos, los dos hacen falta.

Pendiente menor no bloqueante: confirmar que la privacidad de WHOIS del dominio quedó activa (la pantalla de Registrant Information de Vercel muestra nombre, dirección, correo y teléfono reales).

## Gotcha para la próxima vez que se toque

Cambios en `config.toml` (`[auth]`) solo pegan en local vía `supabase stop && supabase start`. Cambios que importan para prod van siempre por Dashboard del proyecto remoto, no por git.
