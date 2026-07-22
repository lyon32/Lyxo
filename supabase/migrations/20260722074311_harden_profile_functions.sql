-- Corrige les 2 warnings advisor relevés après 20260722072825 : search_path
-- mutable + RPC publique non voulue sur des fonctions destinées uniquement
-- aux triggers.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
