-- Migration ROADMAP 2.1 — exercises (DATA_MODEL.md §2.3).
-- Référentiel en lecture seule côté client, peuplé par le script d'import
-- backend/scripts/import-exercises.ts (source : free-exercise-db, licence
-- Unlicense — remplace ExerciseDB Pro, cf. décision ARCHITECTURE.md).

create table exercises (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,           -- id free-exercise-db source
  name_fr text not null,
  name_en text not null,
  muscle_group text not null,        -- slug canonique EN (traduit à l'affichage via i18n)
  equipment text,                    -- idem, slug canonique EN
  gif_url text,
  is_embedded_pack boolean not null default false,  -- les ~50 du pack de base
  created_at timestamptz not null default now()
);
create index idx_exercises_muscle_group on exercises(muscle_group);
create index idx_exercises_embedded_pack on exercises(is_embedded_pack) where is_embedded_pack = true;

alter table exercises enable row level security;

-- Référentiel public : tout le monde (y compris anon) peut lire la
-- bibliothèque d'exercices, aucune écriture côté client (le service role
-- du backend bypass RLS pour l'import/la maintenance — aucune policy
-- insert/update/delete n'est créée ici).
create policy exercises_select_all on exercises
  for select
  using (true);
