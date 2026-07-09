begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trabajador-fotos', 'trabajador-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "trabajador_fotos_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'trabajador-fotos');

create policy "trabajador_fotos_insert_own_finca"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'trabajador-fotos'
    and exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id = (storage.foldername(name))[1]
    )
  );

create policy "trabajador_fotos_update_own_finca"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'trabajador-fotos'
    and exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'trabajador-fotos'
    and exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id = (storage.foldername(name))[1]
    )
  );

create policy "trabajador_fotos_delete_own_finca"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'trabajador-fotos'
    and exists (
      select 1
      from public.usuario
      where usuario.auth_user_id = auth.uid()
        and usuario.activo = true
        and usuario.finca_id = (storage.foldername(name))[1]
    )
  );

commit;
