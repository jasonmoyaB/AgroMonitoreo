begin;

-- El Auth Hook "Password Verification Attempt" (supabase/migrations/20260715155544)
-- requiere plan Teams o Enterprise en Supabase hosted; este proyecto está en plan
-- Free (confirmado: `supabase config push` devolvió 402 "cannot be configured for
-- this organization"). GoTrue nunca va a poder invocar esta función sin el hook
-- registrado, así que queda muerta — se elimina en vez de dejarla huérfana.
-- El rate limit por IP (auth.rate_limit.sign_in_sign_ups) y el cooldown del
-- cliente siguen vigentes; CAPTCHA queda como alternativa recomendada si se
-- quiere una barrera anti-bot real sin subir de plan.
drop function if exists public.hook_rate_limit_password(jsonb);
drop table if exists public.intentos_login_fallidos;

commit;
