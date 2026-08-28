# Spec — asistencia

Feature **headless**. La hospedan `supervisor/screens/AsistenciaScreen.tsx` y `admin/screens/AsistenciaPorFincaScreen.tsx`.

## Qué hace

- Marcar la ausencia de un trabajador en un día.
- Tabla semanal, calendario mensual de ausentes, panel por trabajador.
- PDF de ausencias del período.

## Reglas

- Tipos de ausencia: `vacaciones`, `permisos`, `permisos_medicos`. No hay más.
- Una fila por `trabajador_id + fecha` — la unicidad es compuesta. Por eso el generador de tipos marca el embed como array aunque PostgREST devuelva un objeto: hay que narrowear en el service.
- **Las tres cuentan para el descuento de la quincena**, decisión explícita del usuario pese a que en Costa Rica las vacaciones son tiempo pagado y la incapacidad la cubre CCSS/INS. El cálculo no vive acá sino en `planilla`.
- El fin de un rango mensual es el **día 1 del mes siguiente**, no el 31: `'2026-02-31'` no existe y Postgres rechaza el cast. Ver `hastaExclusivo` en `shared/utils/fecha-iso.ts`.
- El calendario sigue el patrón de `docs/instruccions/6-patron-calendarios.md`; los huecos del mes los arma `obtener-espacios-calendario.ts`.

## Qué NO hace

- No calcula plata. La deducción es de `planilla`.
- No distingue justificada de injustificada más allá de los tres tipos.
- No tiene ruta propia.
