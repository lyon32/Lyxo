-- Migration ROADMAP 2.6 — workouts + workout_exercises + sets
-- (DATA_MODEL.md §2.5, §2.6, §2.7). Les trois tables [SYNC] du logger.
--
-- ⚠️ Ces tables sont INERTES jusqu'à la Phase 3 (sync) : rien côté serveur
-- ne les lit ni ne les écrit avant. Leur seule contrepartie vivante est le
-- schéma WatermelonDB (`db/schema.ts`), écrit dans la même tâche et aligné
-- colonne par colonne. Toute divergence introduite ici passera donc
-- inaperçue pendant des semaines, jusqu'en plein Bloc C — d'où la table de
-- correspondance explicite en tête de `db/schema.ts`.
--
-- Précision numérique : `numeric(10,2)` / `numeric(8,2)` appliqués DÈS LA
-- CRÉATION plutôt que par un ALTER post-hoc (CLAUDE_LYXO_V3 §17bis.2, "à
-- exécuter avant le premier insert"). En float, 82.5 + 82.5 + 82.5 donne
-- 247.50000000000003 — une dérive silencieuse qui fausserait les stats et
-- les comparaisons de PR.

-- §2.5 workouts ------------------------------------------------------------

create table workouts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  local_id text not null,             -- id généré client (offline)
  title text,
  -- ⚠️ SANS contrainte FK, volontairement : `programs` n'existe qu'en
  -- Phase 6 alors que cette table naît en Phase 2. La FK est ajoutée par la
  -- migration Phase 6 (DATA_MODEL §2.5) :
  --   alter table workouts add constraint fk_workouts_program
  --     foreign key (program_id) references programs(id);
  program_id uuid,
  started_at timestamptz not null,
  completed_at timestamptz,
  total_volume_kg numeric(10, 2),     -- calculé/caché à la complétion
  is_private boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotence de la sync : un même `local_id` rejoué ne crée pas de doublon.
create unique index uq_workout_local on workouts(profile_id, local_id);
create index idx_workouts_profile_date on workouts(profile_id, started_at desc);

create trigger set_workouts_updated_at
  before update on workouts
  for each row execute function public.set_updated_at();

-- §2.6 workout_exercises ---------------------------------------------------

create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id),
  exercise_id uuid references exercises(id),
  custom_exercise_id uuid references custom_exercises(id),
  order_index int not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un exercice de séance vient soit du référentiel, soit des exercices
  -- perso — jamais des deux, jamais d'aucun.
  check (exercise_id is not null or custom_exercise_id is not null)
);
create index idx_we_workout on workout_exercises(workout_id);

create trigger set_workout_exercises_updated_at
  before update on workout_exercises
  for each row execute function public.set_updated_at();

-- §2.7 sets ----------------------------------------------------------------

create table sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises(id),
  set_number int not null,
  -- STOCKAGE CANONIQUE en kg (§19.15) — jamais de lbs en base, quelle que
  -- soit l'unité d'affichage choisie par l'utilisateur.
  weight_kg numeric(8, 2) not null,
  reps int not null,
  -- RPE sur 1-10, jamais en pourcentage (SECURITY_NOTES §2.2).
  rpe numeric check (rpe between 1 and 10),
  is_completed boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_sets_we on sets(workout_exercise_id);

create trigger set_sets_updated_at
  before update on sets
  for each row execute function public.set_updated_at();

-- RLS ----------------------------------------------------------------------
-- DATA_MODEL §2.5-2.7 (audit doc #23, defense-in-depth). `workout_exercises`
-- et `sets` n'ont pas de règle propre : ils héritent de la visibilité du
-- `workout` ancêtre, exprimée ici par des EXISTS plutôt que par une fonction
-- partagée — une fonction appelée depuis une policy doit rester EXECUTE-able
-- par `authenticated`, donc exposée en RPC, ce que l'advisor Supabase avait
-- déjà signalé sur les fonctions trigger (cf. 20260722074311).

alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table sets enable row level security;

-- Lecture : soi-même toujours.
create policy workouts_select_own on workouts
  for select
  using (auth.uid() = profile_id);

-- Lecture par un tiers : séance non privée d'un profil non privé.
-- ⚠️ Le volet "follow actif" de DATA_MODEL §2.5 arrive en Phase 5, quand la
-- table `follows` existera — même report que sur `profiles` (§2.1). En
-- attendant, un profil privé n'est lisible que par lui-même, ce qui est le
-- sens strict (jamais plus permissif que la cible).
create policy workouts_select_public on workouts
  for select
  using (
    deleted_at is null
    and is_private = false
    and exists (
      select 1 from profiles p
      where p.id = workouts.profile_id
        and p.deleted_at is null
        and p.is_private = false
    )
  );

create policy workouts_insert_own on workouts
  for insert
  with check (auth.uid() = profile_id);

create policy workouts_update_own on workouts
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Pas de policy DELETE sur les trois tables : la suppression est un soft
-- delete (`deleted_at`), requis par le protocole de sync (API_SPEC §4.1) —
-- un DELETE physique ne serait jamais propagé aux autres appareils.

create policy workout_exercises_select on workout_exercises
  for select
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id
        and (
          w.profile_id = auth.uid()
          or (
            w.deleted_at is null
            and w.is_private = false
            and exists (
              select 1 from profiles p
              where p.id = w.profile_id
                and p.deleted_at is null
                and p.is_private = false
            )
          )
        )
    )
  );

create policy workout_exercises_insert_own on workout_exercises
  for insert
  with check (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id
        and w.profile_id = auth.uid()
    )
  );

create policy workout_exercises_update_own on workout_exercises
  for update
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id
        and w.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workouts w
      where w.id = workout_exercises.workout_id
        and w.profile_id = auth.uid()
    )
  );

create policy sets_select on sets
  for select
  using (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = sets.workout_exercise_id
        and (
          w.profile_id = auth.uid()
          or (
            w.deleted_at is null
            and w.is_private = false
            and exists (
              select 1 from profiles p
              where p.id = w.profile_id
                and p.deleted_at is null
                and p.is_private = false
            )
          )
        )
    )
  );

create policy sets_insert_own on sets
  for insert
  with check (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = sets.workout_exercise_id
        and w.profile_id = auth.uid()
    )
  );

create policy sets_update_own on sets
  for update
  using (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = sets.workout_exercise_id
        and w.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from workout_exercises we
      join workouts w on w.id = we.workout_id
      where we.id = sets.workout_exercise_id
        and w.profile_id = auth.uid()
    )
  );
