begin;

revoke execute on function public.crear_usuario_desde_auth() from anon, authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from anon, authenticated;
  end if;
end
$$;

drop policy if exists "trabajador_fotos_select_public" on storage.objects;

commit;
