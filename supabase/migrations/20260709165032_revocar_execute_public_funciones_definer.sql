begin;

revoke execute on function public.crear_usuario_desde_auth() from public;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public;
  end if;
end
$$;

commit;
