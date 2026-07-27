-- Migration ROADMAP 2.2 — custom_exercises (DATA_MODEL.md §2.4).
-- Exercices créés par l'utilisateur, en complément du référentiel
-- `exercises` (§2.3). Table [SYNC] : soft delete via `deleted_at`,
-- `updated_at` pour la comparaison incrémentale de GET /v1/sync/pull
-- (API_SPEC.md §4.1).

create table custom_exercises (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  name text not null,
  muscle_group text,                 -- slug canonique EN, comme exercises.muscle_group
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_custom_exercises_profile on custom_exercises(profile_id)
  where deleted_at is null;

create trigger set_custom_exercises_updated_at
  before update on custom_exercises
  for each row execute function public.set_updated_at();

-- Limite gratuite : 5 exercices custom -------------------------------------

-- DATA_MODEL §2.4 documentait cette limite comme purement applicative. Elle
-- est posée ici en base parce que le client écrit en direct via RLS : une
-- limite côté app seule serait contournable avec la clé anon. Un trigger
-- reste dynamique (contrairement à un CHECK ou un index unique, écartés sur
-- `devices` pour cette raison précise, §2.2) et s'applique aussi aux écritures
-- service_role du backend, qui bypassent RLS mais pas les triggers — donc
-- couvre aussi le push de sync à venir (Phase 3).
--
-- Le "si gratuit" de la règle passe par has_active_premium() ci-dessous :
-- aujourd'hui essai seulement, l'abonnement arrive en Phase 9.
create or replace function public.has_active_premium(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- ⚠️ Phase 9 (ROADMAP 9.x, PRICING.md) : ajouter ici le OR sur un
  -- abonnement actif une fois la table `subscriptions` créée. Tant qu'elle
  -- n'existe pas, seul un essai en cours confère le statut premium —
  -- cohérent avec CLAUDE_LYXO_V3 §"aucun abonnement actif = expérience
  -- gratuite".
  select exists (
    select 1
    from profiles
    where id = p_profile_id
      and trial_expires_at is not null
      and trial_expires_at > now()
  );
$$;

create or replace function public.enforce_custom_exercise_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.has_active_premium(new.profile_id) then
    return new;
  end if;

  -- Les lignes soft-deleted ne comptent pas : supprimer un exercice custom
  -- doit vraiment libérer un emplacement.
  if (
    select count(*)
    from custom_exercises
    where profile_id = new.profile_id
      and deleted_at is null
      and id is distinct from new.id
  ) >= 5 then
    raise exception 'CUSTOM_EXERCISE_LIMIT_REACHED'
      using errcode = 'LYX01',
            hint = 'Free plan allows 5 custom exercises (PRICING.md).';
  end if;

  return new;
end;
$$;

create trigger enforce_custom_exercise_limit_on_insert
  before insert on custom_exercises
  for each row execute function public.enforce_custom_exercise_limit();

-- Une restauration (deleted_at repassé à NULL, cas réel en sync offline)
-- consomme un emplacement au même titre qu'une création.
create trigger enforce_custom_exercise_limit_on_undelete
  before update on custom_exercises
  for each row
  when (old.deleted_at is not null and new.deleted_at is null)
  execute function public.enforce_custom_exercise_limit();

-- Fonctions de trigger : jamais appelables en RPC depuis le client, et
-- search_path épinglé (mêmes 2 warnings advisor que 20260722074311).
revoke execute on function public.has_active_premium(uuid) from public, anon, authenticated;
revoke execute on function public.enforce_custom_exercise_limit() from public, anon, authenticated;

-- RLS ----------------------------------------------------------------------

alter table custom_exercises enable row level security;

-- DATA_MODEL §2.4 : perso, jamais social — aucune lecture par un tiers,
-- même en follow approuvé (contrairement à profiles/workouts).
create policy custom_exercises_select_own on custom_exercises
  for select
  using (auth.uid() = profile_id);

create policy custom_exercises_insert_own on custom_exercises
  for insert
  with check (auth.uid() = profile_id);

-- Pas de policy DELETE : suppression = soft delete (`deleted_at`), requis
-- par le protocole de sync (API_SPEC.md §4.1) — un DELETE physique ne
-- serait jamais propagé aux autres appareils.
create policy custom_exercises_update_own on custom_exercises
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
