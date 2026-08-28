# Spec — perfil

Feature **headless**. La hospedan `supervisor/screens/ConfiguracionScreen.tsx` y `admin/screens/ConfiguracionScreen.tsx`.

## Qué hace

Lo que un operador puede cambiar **de sí mismo**:

- Su nombre (`EditarNombreForm`).
- Su contraseña (`CambiarPasswordForm`).
- Sus datos personales (`DatosPersonalesForm`): cédula, dirección, fecha de nacimiento, teléfono, email de contacto — columnas de `usuario`.

## Reglas

- **Solo la fila propia.** El alcance de lectura de `usuario` es dueño-de-la-fila + oficina. Esa tabla guarda PII del operador, así que **nunca agregar una policy de lectura cruzada sobre `usuario`** sin antes mover esas columnas a tabla aparte.
- El cambio de contraseña pasa por `auth-service.ts`, o sea que hereda el chequeo de contraseñas filtradas y los requisitos mínimos. No duplicar la validación acá.
- El email de contacto se valida con `validar-email-contacto.ts` y **no** es el email de login: cambiarlo no cambia con qué entra.
- Rol y finca no se editan desde acá. Los mueve el admin en `/admin/supervisores`.

## Qué NO hace

- No tiene ruta propia.
- No edita a otros usuarios.
- No cambia el email de autenticación.
