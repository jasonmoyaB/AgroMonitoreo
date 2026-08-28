# Spec — auth

Entrar, salir, recuperar contraseña y decidir quién ve qué ruta. No hay registro público.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/login` | `LoginScreen` |
| `/olvide-password` | `ForgotPasswordScreen` |
| `/reset-password` | `ResetPasswordScreen` — también recibe la invitación con `?invitacion=1` |

## Reglas

- **Nadie se registra solo.** `enable_signup = false`. El admin invita desde `/admin/supervisores`; el invitado nace `supervisor` con `finca_id` null.
- **Un solo guard.** `RouteGuard`, con prop `soloAdmin`. La decisión vive en `utils/decidir-acceso-ruta.ts` y devuelve `cargando | a-login | a-admin | a-supervisor | sin-finca | permitido`. El componente solo traduce eso a JSX.
- **Supervisor sin finca no entra.** Ve `SinFincaAsignada`, con botón de salir. El admin no depende de finca propia: elige finca a mano en cada pantalla.
- **Contraseña**: mínimo 8 caracteres (`evaluar-requisitos-password.ts`, pintado en vivo por `PasswordChecklist`) **y** no haber aparecido en filtraciones. El chequeo de HaveIBeenPwned corre por k-anonymity (solo salen 5 caracteres del SHA-1) y **falla abierto**: sin red, timeout de 4 s o `crypto.subtle` ausente, deja pasar.
- La guarda pwned va en `auth-service.ts`, el único lugar del repo que llama `updateUser({ password })` — así cubre reset, invitación y cambio desde perfil de una sola vez.
- **Cooldown de login** en el cliente tras 2 intentos fallidos: 2 s que duplican hasta 30 s (`use-login-cooldown.ts`). Es UX, no seguridad — el freno real es el rate limit por IP de GoTrue.
- Los errores de Supabase se traducen a español en `utils/traducir-error-auth.ts`. Nunca mostrar el mensaje crudo.

## Qué NO hace

- No hay `AuthGuard.tsx` ni `AdminGuard.tsx`. Un componente, una prop.
- No hay MFA ni enrolamiento. Decisión consciente: capataces de baja alfabetización.
- No hay pantalla `/registro`.
- No manda correos: los manda Supabase Auth por SMTP de Resend, con las plantillas de `supabase/templates/`.
