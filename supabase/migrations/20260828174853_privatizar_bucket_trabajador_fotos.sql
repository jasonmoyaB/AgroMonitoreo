-- El bucket trabajador-fotos era publico y su policy de lectura era `to public using(true)`:
-- el unico lugar del sistema donde datos de trabajadores vivian FUERA de la RLS.
--
-- No era enumerable (el archivo se llama con un uuid v4 y la URL solo se consigue leyendo
-- la fila del trabajador), pero una URL filtrada — compartida, en un log, en el historial,
-- dentro de un PDF exportado — es acceso permanente y sin autenticacion a la foto de una
-- persona. Vendiendole la app a terceros eso deja de ser aceptable: no hay frontera de
-- organizacion posible sobre un objeto publico.
--
-- La ruta ya arranca con la finca (`<finca_id>/<uuid>.<ext>`, ver foto-trabajador-service),
-- asi que el mismo scoping por organizacion que usan las tablas aplica tal cual sobre
-- storage.foldername(name)[1].

begin;

update storage.buckets
   set public = false
 where id = 'trabajador-fotos';

-- La lectura era para el rol `public`, o sea sin sesion.
drop policy if exists "trabajador_fotos_select_public" on storage.objects;

create policy "trabajador_fotos_select_mi_organizacion"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'trabajador-fotos'
    and (storage.foldername(name))[1] in (select * from private.fincas_de_mi_organizacion())
  );

-- Las tres de escritura ya acotaban a la finca propia del usuario, que es exacta y por lo
-- tanto ya era segura entre organizaciones. Se reescriben solo para cambiar el EXISTS
-- correlacionado contra `usuario` por el helper, igual que hizo 20260818184228 con las
-- policies de las tablas: un auth.uid() suelto se re-evalua por fila (advisor 0003).
drop policy if exists "trabajador_fotos_insert_own_finca" on storage.objects;
drop policy if exists "trabajador_fotos_update_own_finca" on storage.objects;
drop policy if exists "trabajador_fotos_delete_own_finca" on storage.objects;

create policy "trabajador_fotos_insert_own_finca"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'trabajador-fotos'
    and (storage.foldername(name))[1] = (select private.finca_del_usuario())
  );

create policy "trabajador_fotos_update_own_finca"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'trabajador-fotos'
    and (storage.foldername(name))[1] = (select private.finca_del_usuario())
  )
  with check (
    bucket_id = 'trabajador-fotos'
    and (storage.foldername(name))[1] = (select private.finca_del_usuario())
  );

create policy "trabajador_fotos_delete_own_finca"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'trabajador-fotos'
    and (storage.foldername(name))[1] = (select private.finca_del_usuario())
  );

commit;
