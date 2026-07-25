-- Migration ROADMAP 2.1 (complément) — ajoute `updated_at` sur exercises.
-- DATA_MODEL.md §2.3 (audit doc #4) : la table `exercises` doit porter
-- `updated_at` pour etre compatible avec le protocole GET /v1/sync/pull
-- (comparaison incrementale sur `since`) — indispensable pour pousser une
-- mise a jour du catalogue (ex. bascule ExerciseDB Pro) sans redeploiement
-- de l'app. Voir API_SPEC.md §4.1.
--
-- La migration create_exercises (20260723180114) avait omis cette colonne,
-- creant une derive migration <-> DATA_MODEL corrigee ici. `if not exists`
-- rend la migration idempotente (re-application sans effet).
alter table exercises
  add column if not exists updated_at timestamptz not null default now();
