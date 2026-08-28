# Spec — trabajadores

Feature **headless**: no tiene rutas propias. La hospedan `supervisor/screens/TrabajadoresCrudScreen.tsx` y `admin/screens/TrabajadoresPorFincaScreen.tsx`.

## Qué hace

- CRUD de trabajadores de una finca, con **baja lógica** (`activo`), nunca borrado físico.
- Foto: sube al bucket `trabajador-fotos`, carpeta por finca.
- Datos personales (cédula, fecha de ingreso, teléfono) contra `datos_trabajadores`.
- Modal de métricas por trabajador: horas, cantidad por unidad, productividad y horas extra de un período, con PDF.

## Reglas

- **El salario no vive acá.** Está en `salarios_trabajadores` y se edita en `/admin/planilla`. La policy de `trabajadores` abre la tabla entera a propósito (traslados necesita listar trabajadores de otras fincas), así que cualquier columna que se agregue queda legible por supervisores ajenos. La PII fue a `datos_trabajadores` por lo mismo.
- `asegurado` es la excepción aceptada, y **solo lo edita la oficina** desde `/admin/trabajadores`. El toggle salió de `TrabajadorForm` y `actualizarTrabajador` hace patch parcial sin esa columna.
- **La foto se valida por MIME y por magic bytes** (`validar-foto-trabajador.ts`). La extensión no prueba nada. Tope 5MB, `jpeg`/`png`/`webp`.
- Al embeber `datos_trabajadores` hay que **nombrar el FK**: `datos:datos_trabajadores!datos_trabajadores_trabajador_id_fkey(...)`. Con el compuesto, el embed vuelve array y todas las cédulas quedan `null` en silencio.
- Las métricas agrupan cantidad **por unidad** (`agrupar-cantidad-por-unidad.ts`): cajas y tramos no se suman.
- Horas extra: acumulado del día del trabajador sumando todas sus labores, estrictamente `> 8`.

## Qué NO hace

- No pinta rutas ni sidebar. Eso es del shell que la hospeda.
- No borra filas.
- No toca salarios ni pagos.
