begin;

-- Estos datos van en columnas de usuario y NO en una tabla aparte, al reves de lo
-- que se hizo con salarios_trabajadores (20260728100100) y datos_trabajadores
-- (20260814173849). La diferencia no es de criterio sino de alcance de RLS: aquellas
-- dos salieron de trabajadores porque trabajadores_select_activos_multi_finca es
-- `using (activo = true)` sin scoping de finca, o sea que cualquier supervisor leia
-- PII de otra finca. Sobre usuario las unicas policies de select son
-- usuario_select_own (auth_user_id = auth.uid()) y usuario_select_admin_oficina,
-- asi que el alcance ya es exactamente "el dueno de la fila y la oficina".
-- Si algun dia se agrega una policy de lectura cross-usuario para supervisores,
-- estas columnas hay que mudarlas siguiendo 20260728100100.
alter table public.usuario
  add column telefono text,
  add column email_contacto text,
  add column cedula text,
  add column fecha_nacimiento date,
  add column direccion text,
  add column contacto_emergencia text;

-- email_contacto es un dato de contacto, NO la credencial de acceso. El correo con
-- el que se inicia sesion vive en auth.users y solo se cambia por el flujo de
-- confirmacion de Supabase; usuario.email es su espejo. Se usa el mismo regex que
-- la columna email (20260708173349) para no aceptar aca lo que alla se rechaza.
alter table public.usuario
  add constraint usuario_email_contacto_formato
  check (email_contacto is null or email_contacto ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

-- misma forma que datos_trabajadores.cedula: o null, o algo escrito de verdad.
-- Sin esto un submit del form guarda '' y la ficha queda "llena" con nada.
alter table public.usuario
  add constraint usuario_cedula_no_vacia
  check (cedula is null or length(btrim(cedula)) > 0);

-- Deliberadamente sin indice unico sobre cedula: datos_trabajadores lo lleva porque
-- dos trabajadores de una finca no pueden repetir cedula, pero aca son un punado de
-- usuarios y un unique obligaria a resolver el choque en una pantalla que no existe.

-- Endurecer el trigger: usuario.email lo sella crear_usuario_desde_auth() en el
-- INSERT y nadie mas deberia tocarlo. Hasta ahora la policy usuario_update_own
-- (20260715171832) dejaba que el dueno de la fila lo reescribiera a mano. No es
-- escalada de privilegios -- no da acceso a nada -- pero desincroniza el espejo del
-- login: /admin/supervisores termina mostrando un correo que no sirve para entrar,
-- y el admin invita o busca contra un dato falso. La guarda va antes del early
-- return de admin porque el problema es el mismo venga de quien venga, y ningun
-- service del front manda esta columna en un update (supervisores-service.ts solo
-- escribe nombre/rol_id/finca_id/activo).
--
-- Cuerpo calificado y search_path = '' conservados de 20260803232810, incluida la
-- llamada a private.es_admin_oficina(): plpgsql resuelve el nombre en runtime.
create or replace function public.evitar_escalada_privilegios_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    raise exception 'El correo de acceso no se cambia desde aqui.';
  end if;

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

-- un trigger no necesita EXECUTE del rol que dispara la sentencia (20260803232810).
revoke execute on function public.evitar_escalada_privilegios_usuario() from anon, authenticated;

-- no hay tabla nueva, pero el grant de usuario ya estaba (20260714171721) y las
-- columnas nuevas lo heredan: un grant a nivel tabla cubre las columnas agregadas
-- despues. No hace falta reemitirlo.

commit;
