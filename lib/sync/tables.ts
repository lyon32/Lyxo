import { Q } from '@nozbe/watermelondb';

import { database } from '../../db/index';
import type { PersonalRecord } from '../../db/models/PersonalRecord';
import type { Workout } from '../../db/models/Workout';
import type { WorkoutExercise } from '../../db/models/WorkoutExercise';
import type { WorkoutSet } from '../../db/models/WorkoutSet';

// Mapping par table entre les modèles WatermelonDB (camelCase, epoch ms) et
// le JSON envoyé/reçu par `/v1/sync/push`/`/v1/sync/pull` (snake_case, ISO
// 8601) — ROADMAP 3.5. Pas de mapping générique : chaque table a des
// champs propres, un générique masquerait des erreurs de colonne plutôt
// que de les faire échouer à la compilation.
//
// ⚠️ `exercises` n'a AUCUNE table WatermelonDB locale (référentiel lu
// directement depuis Supabase, `lib/exercises-store.ts`, ROADMAP 2.12) :
// elle n'apparaît PAS ici, uniquement dans l'allowlist backend
// (`backend/src/lib/sync-tables.ts`), où elle reste pull-able pour un
// usage futur hors de ce moteur.
export const SYNC_TABLES = ['workouts', 'workout_exercises', 'sets', 'personal_records'] as const;
export type SyncTableName = (typeof SYNC_TABLES)[number];

// `local_id` envoyé au serveur = l'`id` WatermelonDB du record lui-même,
// jamais un second UUID généré (CLAUDE_LYXO_V3.md §16.3, voir aussi
// `db/schema.ts`) — c'est aussi l'identité universelle qui permet de
// retrouver/créer la bonne ligne locale à la réception d'un pull.
export interface PushPayload {
  local_id: string;
  [key: string]: unknown;
}

// ⚠️ Les colonnes de clé étrangère ici (`workout_id`, `workout_exercise_id`,
// `set_id`) sont déjà le `local_id` du parent, PAS un id serveur — corrigé
// côté backend (`backend/src/routes/sync.ts`, `remapParentLocalIds`,
// 2026-07-31) précisément pour que ce module n'ait jamais à résoudre un id
// serveur en local_id : le client ne voit et ne persiste QUE des local_id.
export interface PulledRow {
  local_id: string;
  updated_at: string;
  deleted_at: string | null;
  [key: string]: unknown;
}

function toIso(epochMs: number | null): string | null {
  return typeof epochMs === 'number' ? new Date(epochMs).toISOString() : null;
}

function toEpochMs(iso: string | null | undefined): number | null {
  return iso ? new Date(iso).getTime() : null;
}

// --- workouts --------------------------------------------------------------

function workoutToPush(row: Workout): PushPayload {
  return {
    local_id: row.id,
    title: row.title,
    program_id: row.programId,
    started_at: toIso(row.startedAt ? +row.startedAt : null),
    completed_at: toIso(row.completedAt ? +row.completedAt : null),
    total_volume_kg: row.totalVolumeKg,
    is_private: row.isPrivate,
  };
}

function applyWorkoutRaw(raw: Record<string, unknown>, row: PulledRow) {
  raw.profile_id = row.profile_id;
  raw.title = row.title ?? null;
  raw.program_id = row.program_id ?? null;
  raw.started_at = toEpochMs(row.started_at as string);
  raw.completed_at = toEpochMs(row.completed_at as string | null);
  raw.total_volume_kg = row.total_volume_kg ?? null;
  raw.is_private = Boolean(row.is_private);
}

// --- workout_exercises -------------------------------------------------------

function workoutExerciseToPush(row: WorkoutExercise): PushPayload {
  return {
    local_id: row.id,
    workout_id: row.workoutId, // local_id du parent
    exercise_id: row.exerciseId,
    custom_exercise_id: row.customExerciseId,
    order_index: row.orderIndex,
  };
}

function applyWorkoutExerciseRaw(raw: Record<string, unknown>, row: PulledRow) {
  raw.workout_id = row.workout_id; // déjà un local_id, voir commentaire PulledRow
  raw.exercise_id = row.exercise_id ?? null;
  raw.custom_exercise_id = row.custom_exercise_id ?? null;
  raw.order_index = row.order_index ?? 0;
}

// --- sets --------------------------------------------------------------------

function setToPush(row: WorkoutSet): PushPayload {
  return {
    local_id: row.id,
    workout_exercise_id: row.workoutExerciseId, // local_id du parent
    set_number: row.setNumber,
    weight_kg: row.weightKg,
    reps: row.reps,
    rpe: row.rpe,
    is_completed: row.isCompleted,
  };
}

function applySetRaw(raw: Record<string, unknown>, row: PulledRow) {
  raw.workout_exercise_id = row.workout_exercise_id; // déjà un local_id
  raw.set_number = row.set_number ?? 0;
  raw.weight_kg = row.weight_kg ?? 0;
  raw.reps = row.reps ?? 0;
  raw.rpe = row.rpe ?? null;
  raw.is_completed = Boolean(row.is_completed);
}

// --- personal_records ----------------------------------------------------------

function personalRecordToPush(row: PersonalRecord): PushPayload {
  return {
    local_id: row.id,
    exercise_id: row.exerciseId, // id serveur réel (référentiel), pas une référence locale
    set_id: row.setId, // local_id du set parent, si connu
    weight_kg: row.weightKg,
    reps: row.reps,
    estimated_1rm_kg: row.estimated1RmKg,
    pr_type: row.prType,
    is_social_eligible: row.isSocialEligible,
    ineligibility_reason: row.ineligibilityReason,
    achieved_at: toIso(row.achievedAt ? +row.achievedAt : null),
  };
}

function applyPersonalRecordRaw(raw: Record<string, unknown>, row: PulledRow) {
  raw.profile_id = row.profile_id;
  raw.exercise_id = row.exercise_id;
  raw.set_id = row.set_id ?? null; // déjà un local_id (ou null)
  raw.weight_kg = row.weight_kg ?? 0;
  raw.reps = row.reps ?? 0;
  raw.estimated_1rm_kg = row.estimated_1rm_kg ?? null;
  raw.pr_type = row.pr_type;
  raw.is_social_eligible = Boolean(row.is_social_eligible);
  raw.ineligibility_reason = row.ineligibility_reason ?? null;
  raw.achieved_at = toEpochMs(row.achieved_at as string) ?? Date.now();
}

function toPushMapper(table: SyncTableName) {
  switch (table) {
    case 'workouts':
      return workoutToPush as (row: unknown) => PushPayload;
    case 'workout_exercises':
      return workoutExerciseToPush as (row: unknown) => PushPayload;
    case 'sets':
      return setToPush as (row: unknown) => PushPayload;
    case 'personal_records':
      return personalRecordToPush as (row: unknown) => PushPayload;
  }
}

function applyRawMapper(table: SyncTableName) {
  switch (table) {
    case 'workouts':
      return applyWorkoutRaw;
    case 'workout_exercises':
      return applyWorkoutExerciseRaw;
    case 'sets':
      return applySetRaw;
    case 'personal_records':
      return applyPersonalRecordRaw;
  }
}

// Lignes localement modifiées/créées (à envoyer via `created`, upsert —
// voir `engine.ts` pour pourquoi le client n'utilise jamais `updated`) et
// localement supprimées (à envoyer via `deleted`, par `local_id`) depuis le
// dernier push réussi.
export async function fetchChangedRows(
  table: SyncTableName,
  sinceEpochMs: number,
): Promise<{ created: PushPayload[]; deletedLocalIds: string[] }> {
  const collection = database.get(table);

  const changedRows = await collection
    .query(Q.where('updated_at', Q.gt(sinceEpochMs)), Q.where('deleted_at', null))
    .fetch();
  const deletedRows = await collection.query(Q.where('deleted_at', Q.gt(sinceEpochMs))).fetch();

  const toPush = toPushMapper(table);
  return {
    created: changedRows.map((row) => toPush(row)),
    deletedLocalIds: deletedRows.map((row) => row.id),
  };
}

// Construit le "dirty raw" WatermelonDB (colonnes brutes, epoch ms) d'une
// ligne pull-ée, prêt pour `collection.prepareCreateFromDirtyRaw({ id, ... })`
// ou pour mettre à jour un record existant trouvé par `local_id`.
export function buildRawFromPulledRow(table: SyncTableName, row: PulledRow): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    deleted_at: toEpochMs(row.deleted_at),
    created_at: toEpochMs(row.created_at as string | undefined) ?? Date.now(),
    updated_at: toEpochMs(row.updated_at) ?? Date.now(),
  };
  applyRawMapper(table)(raw, row);
  return raw;
}
