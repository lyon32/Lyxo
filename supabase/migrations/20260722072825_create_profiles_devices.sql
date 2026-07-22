-- Migration ROADMAP 1.5 — profiles + devices (DATA_MODEL.md §2.1/2.2).

-- Trigger utilitaire réutilisé par toutes les tables [SYNC] à venir.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2.1 profiles -----------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id),
  username text unique not null,
  display_name text,
  avatar_initials text,              -- fallback LX si pas d'avatar custom
  bio text,
  country text,                       -- déclaré à l'onboarding
  language text not null default 'fr' check (language in ('fr','en')),
  weight_unit text not null default 'kg' check (weight_unit in ('kg','lbs')),
  goal text check (goal in ('force','masse','regularite')),
  preferred_split text check (preferred_split in ('ppl','upper_lower','full_body','custom')),
  weekly_goal int not null default 3 check (weekly_goal between 1 and 7),
  billing_region text not null default 'intl_iap'
    check (billing_region in ('africa_momo','intl_iap')),
  data_saver boolean not null default false,
  is_coach boolean not null default false,
  is_private boolean not null default false,
  is_reviewer boolean not null default false,   -- exclu des stats (SecOps)
  trial_used boolean not null default false,
  trial_expires_at timestamptz,
  hide_lost_titles boolean not null default false,   -- opt-out Trace
  rivalry_notifications boolean not null default true, -- opt-out Conquête
  private_sessions_default boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_username on profiles(username) where deleted_at is null;
create index idx_profiles_billing_region on profiles(billing_region);

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

alter table profiles enable row level security;

-- Lecture publique des profils non privés / non supprimés.
create policy profiles_select_public on profiles
  for select
  using (deleted_at is null and is_private = false);

-- Un profile privé (ou soft-deleted) reste lisible par son propriétaire.
-- ⚠️ "visibles par follows approuvés" (DATA_MODEL §2.1) sera ajouté par
-- la migration Phase 5 (5.1, follows) une fois cette table créée — même
-- pattern que la FK program_id sur workouts (§2.5, ajoutée en Phase 6).
create policy profiles_select_self on profiles
  for select
  using (auth.uid() = id);

-- Écriture : soi-même uniquement, jamais de ligne pour un autre user.
create policy profiles_update_self on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Colonnes réservées backend/admin (jamais éditables par le client) :
-- billing_region, trial_used, trial_expires_at, is_reviewer — RLS ne
-- filtre pas par colonne, donc on le fait via des privilèges Postgres.
revoke update on profiles from authenticated;
grant update (
  username, display_name, avatar_initials, bio, country, language,
  weight_unit, goal, preferred_split, weekly_goal, data_saver, is_private,
  hide_lost_titles, rivalry_notifications, private_sessions_default
) on profiles to authenticated;

-- Trigger de création de profil à l'inscription (IMPLEMENTATION_PLAN A2) :
-- username depuis raw_user_meta_data si fourni au signup, sinon fallback
-- généré (suffixe uuid assez long pour rendre une collision négligeable).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  chosen_username text;
begin
  chosen_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    'lyxo_' || substr(replace(new.id::text, '-', ''), 1, 12)
  );

  insert into public.profiles (id, username)
  values (new.id, chosen_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2.2 devices --------------------------------------------------------------

create table devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  push_token text,
  last_active_at timestamptz not null default now(),
  is_active boolean not null default true,  -- 1 seul actif si gratuit (Q11b)
  created_at timestamptz not null default now()
);
create index idx_devices_profile_active on devices(profile_id) where is_active = true;
-- Pas d'index UNIQUE partiel ici — la règle "1 appareil actif si gratuit"
-- est appliquée par la logique applicative (bloquerait le multi-device
-- des abonnés Lyxo+ sinon), voir ROADMAP 3.6.

alter table devices enable row level security;

create policy devices_select_own on devices
  for select
  using (auth.uid() = profile_id);

create policy devices_insert_own on devices
  for insert
  with check (auth.uid() = profile_id);

create policy devices_update_own on devices
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
