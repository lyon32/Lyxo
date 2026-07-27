-- Defense-in-depth (SECURITY_NOTES.md §2.2 : regex username stricte
-- "appliquée à la création ET à la modification") — PATCH /v1/profiles/me
-- valide déjà le format applicativement (backend/src/lib/username.ts),
-- mais le chemin signup (supabase.auth.signUp -> handle_new_user trigger)
-- ne passait par aucune validation de format avant insertion. Le check
-- constraint ferme ce chemin au niveau DB, source de vérité ultime.
alter table profiles add constraint username_format
  check (username ~ '^[a-z0-9_]{3,20}$');
