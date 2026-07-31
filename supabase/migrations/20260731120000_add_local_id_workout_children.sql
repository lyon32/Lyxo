-- Corrige un gap trouvé en préparant ROADMAP 3.3 : `workout_exercises` et
-- `sets` n'ont jamais eu de `local_id`, alors que LLD.md ("AJOUT audit
-- technique 2026-07-25") exige l'idempotence PAR ENTITÉ, pas par batch —
-- "la clé est le local_id de CHAQUE entité". CLAUDE_LYXO_V3.md §16.3 nomme
-- explicitement les trois tables (workouts, workout_exercises, sets) comme
-- devant porter `local_id` + contrainte composite, et qualifie son absence
-- de "finding Critical". La migration de 2.6
-- (20260727120000_create_workout_tables.sql) l'a posée sur `workouts`
-- (`uq_workout_local`) et oubliée sur les deux tables enfants.
--
-- Sans ça : un push rejoué après une réponse perdue (LLD.md, "le cas
-- dangereux — succès non accusé") ne peut pas détecter qu'un set ou un
-- workout_exercise a déjà été inséré, et le rejeu en crée un doublon —
-- exactement le critère de succès n°1 du projet ("zéro perte de donnée")
-- inversé en duplication de donnée.
--
-- ⚠️ PAS de `local_id` distinct généré ici : c'est l'`id` WatermelonDB du
-- record lui-même (jamais réattribué, stable à travers les rejeux) — même
-- principe que `workouts.local_id`, voir `db/schema.ts` (table de
-- correspondance en tête de fichier). Aucun changement côté WatermelonDB :
-- son `.id` existant suffit déjà, `workout_id`/`workout_exercise_id` en
-- local pointent déjà vers l'id local du parent.
--
-- ⚠️ PAS un UNIQUE global sur `local_id` : CLAUDE_LYXO_V3.md §16.3
-- documente que c'était une faille DoS sur `workouts` (un profil malveillant
-- insère le `local_id` d'un autre et bloque sa sync) — corrigée par une
-- contrainte composite `(profile_id, local_id)`. Les deux tables enfants
-- n'ont pas de `profile_id` direct : on scope par le parent, qui lui est
-- déjà scopé à l'utilisateur (et la RLS ferme le reste).
--
-- Tables vides des deux côtés au moment d'écrire ceci (vérifié en lecture,
-- 2026-07-31) : `not null` direct sans étape de backfill, c'est le seul
-- moment où cette migration est aussi simple.

alter table workout_exercises add column local_id text not null;
create unique index uq_workout_exercise_local on workout_exercises(workout_id, local_id);

alter table sets add column local_id text not null;
create unique index uq_set_local on sets(workout_exercise_id, local_id);
