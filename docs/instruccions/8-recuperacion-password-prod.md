# 8. Flujo "olvidé mi contraseña" en producción (Vercel + Supabase)

Flujo vive en `src/features/auth/` (`ForgotPasswordScreen`, `ResetPasswordScreen`, `solicitarRecuperacionPassword`/`actualizarPassword` en `auth-service.ts`), rutas `/olvide-password` y `/reset-password`. `config.toml` solo aplica a `supabase start` local — nada de esto se replica solo al proyecto remoto, hay que setearlo a mano.

## Config que hubo que hacer (proyecto remoto, dashboard `gslahngbkmbblrqeehqj`)

1. **Auth → URL Configuration** (`.../auth/url-configuration`):
   - `Site URL`: `https://agromonitoreo.vercel.app`
   - `Redirect URLs`: `https://agromonitoreo.vercel.app/**`
   - Sin esto, el link del correo cae fuera del allowlist y Supabase hace fallback silencioso a `Site URL` → si `Site URL` no estaba seteado (quedaba el default `127.0.0.1:3000`), el link rompe con "conexión rechazada"; si el fallback cae en `/` con sesión de recovery activa, redirige al dashboard (`/supervisor`) en vez de a `/reset-password`.

2. **Vercel → Environment Variables (Production)**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Vite las hornea en build time — si faltan, la app no explota al buildear, pega a Supabase vacío en runtime.

## Pendiente (bloquea "100% prod" real, no bloquea que el flujo básico funcione)

- **Dominio propio**: hoy corre en `agromonitoreo.vercel.app`. El día que se compre dominio, actualizar `Site URL` + `Redirect URLs` en el paso 1 al dominio nuevo (y en `auth-service.ts` si el redirectTo depende de una env var fija en vez de `window.location.origin`).
- **Resend SMTP** (Auth → SMTP Settings): sin esto el email service default de Supabase tiene tope 2/hora y deliverability floja a Gmail. Ver plan de referencia armado con Claude para el detalle de config (`smtp.resend.com`, dominio verificado, etc).
- **Rate limit** `email_sent` (Auth → Rate Limits): subir una vez Resend esté conectado.
- **`redirectTo` en `auth-service.ts`**: si se usa `import.meta.env.VITE_APP_URL` en vez de `window.location.origin`, hay que setear esa env var en Vercel para cada environment (production, preview) o el link vuelve a caer al fallback roto descrito arriba.

## Gotcha para la próxima vez que se toque

Cambios en `config.toml` (`[auth]`) solo pegan en local vía `supabase stop && supabase start`. Cambios que importan para prod van siempre por Dashboard del proyecto remoto, no por git.
