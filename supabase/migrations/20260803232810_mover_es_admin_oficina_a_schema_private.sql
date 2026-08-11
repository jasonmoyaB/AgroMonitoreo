begin;

-- advisors 0028/0029: es_admin_oficina y evitar_escalada_privilegios_usuario son
-- SECURITY DEFINER, viven en public (schema expuesto por PostgREST) y tienen EXECUTE
-- para anon y authenticated. El "revoke ... from public" de 20260709165032 y
-- 20260714171722 no los saco: esos grants no vienen del pseudo-rol PUBLIC sino de los
-- default privileges que Supabase aplica a toda funcion nueva en public. Hay que
-- revocar de anon/authenticated por nombre.

-- schema para helpers SECURITY DEFINER: no esta en api.schemas de config.toml, asi que
-- PostgREST no lo introspecciona y /rest/v1/rpc/ no lo alcanza.
create schema if not exists private;
grant usage on schema private to authenticated;

-- a es_admin_oficina NO se le puede quitar el EXECUTE: aparece en el USING de tres
-- policies (fincas_select_admin_oficina, usuario_select_admin_oficina,
-- usuario_update_admin_oficina) y esas expresiones corren con los privilegios de quien
-- consulta. Moverla de schema conserva el grant y a la vez la saca de la API publica.
-- Las policies la referencian por OID, asi que siguen funcionando sin recrearlas.
alter function public.es_admin_oficina() set schema private;
revoke execute on function private.es_admin_oficina() from anon;

-- venia con search_path=public, o sea un schema escribible en la ruta de resolucion de
-- una funcion que corre como postgres. El cuerpo ya califica todo (public.usuario,
-- public.roles, auth.uid()), asi que '' no le saca nada.
alter function private.es_admin_oficina() set search_path = '';

-- dos cosas de una:
-- 1. repuntar la llamada a private.* (plpgsql resuelve el nombre en runtime, con el
--    schema viejo el trigger reventaria al dispararse).
-- 2. restaurar la guarda de auth_user_id. El archivo 20260715171832 la tiene, pero se
--    edito despues de aplicarse, asi que a remoto nunca llego: hoy un admin_oficina
--    puede repuntar una fila de usuario a otro auth.users.
create or replace function public.evitar_escalada_privilegios_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.es_admin_oficina() then
    if new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'No puedes cambiar la identidad de usuario.';
    end if;
    return new;
  end if;

  if new.rol_id is distinct from old.rol_id
     or new.finca_id is distinct from old.finca_id
     or new.activo is distinct from old.activo then
    raise exception 'No tienes permiso para modificar rol, finca o estado de tu cuenta.';
  end if;

  return new;
end;
$$;

-- un trigger no necesita EXECUTE del rol que dispara la sentencia: postgres lo chequea
-- al create trigger, no al dispararlo. Mismo criterio con el que ya vive
-- crear_usuario_desde_auth, cuyo ACL no tiene anon ni authenticated y el signup anda.
revoke execute on function public.evitar_escalada_privilegios_usuario() from anon, authenticated;

commit;
