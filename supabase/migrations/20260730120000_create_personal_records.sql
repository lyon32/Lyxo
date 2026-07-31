-- Migration ROADMAP 2.10 — personal_records (DATA_MODEL.md §2.8).
--
-- ⚠️ INERTE jusqu'à la Phase 3 (sync), exactement comme workouts/
-- workout_exercises/sets (20260727120000) : rien côté serveur ne lit ni
-- n'écrit cette table avant. Sa seule contrepartie vivante est le schéma
-- WatermelonDB (`db/schema.ts`), écrit dans la même tâche et aligné colonne
-- par colonne — une divergence introduite ici resterait invisible pendant
-- des semaines, jusqu'en plein Bloc C. Recopié ligne à ligne depuis
-- DATA_MODEL.md §2.8, rien inventé ici.

create table personal_records (
  id uuid primary key default gen_random_uuid(),
  -- AJOUTÉ 2026-07-31 (préparation ROADMAP 3.3, jamais appliqué avant cette
  -- correction) : même gap que workout_exercises/sets — sans `local_id`,
  -- un push rejoué après une réponse perdue duplique le PR. Pas de second
  -- UUID généré : c'est l'`id` WatermelonDB du record (voir `db/schema.ts`).
  local_id text not null,
  profile_id uuid not null references profiles(id),
  exercise_id uuid not null references exercises(id),
  set_id uuid references sets(id),
  weight_kg numeric not null,
  reps int not null,
  estimated_1rm_kg numeric,
  pr_type text not null check (pr_type in ('weight', 'volume', 'reps', '1rm')),
  -- Anti-triche §18.1 : le PR reste vrai pour son auteur (stats perso
  -- intactes), seule sa visibilité aux autres dépend de ces deux colonnes.
  is_social_eligible boolean not null default true,
  ineligibility_reason text,          -- 'implausible_weight' | 'delta_too_high' | 'insufficient_history'
  achieved_at timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_pr_profile_exercise on personal_records(profile_id, exercise_id);
-- Scopé au profil (comme workouts.uq_workout_local), jamais un UNIQUE
-- global sur local_id — CLAUDE_LYXO_V3.md §16.3 documente le global comme
-- une faille DoS (un profil insère le local_id d'un autre et bloque sa sync).
create unique index uq_personal_record_local on personal_records(profile_id, local_id);
-- Règle applicative (§18.1), pas exprimable en CHECK (dépend d'un historique
-- et d'une donnée externe, le poids de corps) :
--   is_social_eligible = false si
--     weight_kg > 4 × body_weight OU delta > +15% vs précédent PR
--     OU < 3 séances loggées sur l'exercice

create trigger set_personal_records_updated_at
  before update on personal_records
  for each row execute function public.set_updated_at();

-- RLS (DATA_MODEL §2.8, audit doc #23, defense-in-depth) -------------------
-- Même limitation interimaire que workouts (20260727120000) : le volet
-- "follow mutuel" de la lecture tierce arrive en Phase 5 avec la table
-- `follows`. En attendant, un tiers ne voit que les PR socialement
-- éligibles d'un profil public — jamais plus permissif que la cible finale.

alter table personal_records enable row level security;

create policy personal_records_select_own on personal_records
  for select
  using (auth.uid() = profile_id);

create policy personal_records_select_public on personal_records
  for select
  using (
    deleted_at is null
    and is_social_eligible = true
    and exists (
      select 1 from profiles p
      where p.id = personal_records.profile_id
        and p.deleted_at is null
        and p.is_private = false
    )
  );

create policy personal_records_insert_own on personal_records
  for insert
  with check (auth.uid() = profile_id);

create policy personal_records_update_own on personal_records
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Pas de policy DELETE : soft delete (`deleted_at`) requis par le protocole
-- de sync (API_SPEC §4.1) — un DELETE physique ne serait jamais propagé aux
-- autres appareils.
