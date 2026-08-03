import { Q } from '@nozbe/watermelondb';

import { database } from './index';
import { requestSync } from '../lib/sync/engine';
import type { PersonalRecord } from './models/PersonalRecord';
import type { Workout } from './models/Workout';
import type { WorkoutExercise } from './models/WorkoutExercise';
import type { WorkoutSet } from './models/WorkoutSet';
import {
  computeVolumeKg,
  detectPRs,
  estimatedOneRepMax,
  evaluatePRSocialEligibility,
  type DetectedPR,
  type IneligibilityReason,
  type PreviousBests,
} from '../lib/pr-detection';

// Pont entre les fonctions pures de `lib/pr-detection.ts` (ROADMAP 2.9) et
// WatermelonDB — DATA_MODEL §2.8, LLD §3.1. Un PR est TOUJOURS écrit dans
// `personal_records` (stats perso intactes) ; `is_social_eligible` décide
// séparément de sa visibilité aux autres.
//
// ⚠️ Pas de `lib/sync/`, pas d'appel réseau ici : la sync serveur reste hors
// périmètre (Bloc C, Phase 3). La migration Postgres correspondante
// (`supabase/migrations/20260730120000_create_personal_records.sql`) est
// écrite mais INERTE tant que cette phase n'existe pas.

export interface CelebratedPR {
  type: DetectedPR['type'];
  value: number;
  previousBest: number | null;
  isSocialEligible: boolean;
  ineligibilityReason: IneligibilityReason;
}

// Historique COMPLET (toutes séances du profil, pas seulement la séance en
// cours) des sets déjà validés sur cet exercice — base de comparaison de
// `detectPRs` et du compteur "séances loggées" de l'anti-triche §18.1.
async function loadExerciseHistory(
  profileId: string,
  exerciseId: string,
): Promise<{ completedSets: WorkoutSet[]; sessionsLogged: number }> {
  const workouts = await database
    .get<Workout>('workouts')
    .query(Q.where('profile_id', profileId), Q.where('deleted_at', null))
    .fetch();
  if (workouts.length === 0) return { completedSets: [], sessionsLogged: 0 };

  const workoutExercises = await database
    .get<WorkoutExercise>('workout_exercises')
    .query(
      Q.where('workout_id', Q.oneOf(workouts.map((w) => w.id))),
      Q.where('exercise_id', exerciseId),
      Q.where('deleted_at', null),
    )
    .fetch();
  if (workoutExercises.length === 0) return { completedSets: [], sessionsLogged: 0 };

  const completedSets = await database
    .get<WorkoutSet>('sets')
    .query(
      Q.where('workout_exercise_id', Q.oneOf(workoutExercises.map((we) => we.id))),
      Q.where('is_completed', true),
      Q.where('deleted_at', null),
    )
    .fetch();

  const sessionsLogged = new Set(workoutExercises.map((we) => we.workoutId)).size;
  return { completedSets, sessionsLogged };
}

function computePreviousBests(sets: WorkoutSet[]): PreviousBests {
  return sets.reduce<PreviousBests>(
    (bests, set) => {
      const volumeKg = computeVolumeKg(set);
      const estimated1Rm = estimatedOneRepMax(set.weightKg, set.reps);
      return {
        weightKg: bests.weightKg === null ? set.weightKg : Math.max(bests.weightKg, set.weightKg),
        volumeKg: bests.volumeKg === null ? volumeKg : Math.max(bests.volumeKg, volumeKg),
        reps: bests.reps === null ? set.reps : Math.max(bests.reps, set.reps),
        estimated1RmKg:
          bests.estimated1RmKg === null
            ? estimated1Rm
            : Math.max(bests.estimated1RmKg, estimated1Rm),
      };
    },
    { weightKg: null, volumeKg: null, reps: null, estimated1RmKg: null },
  );
}

// Détecte les PR d'un set qui vient d'être marqué validé, les persiste dans
// `personal_records` (un row PAR type battu — un même set peut battre
// plusieurs types), et retourne ce qu'il faut pour la célébration à l'écran.
//
// ⚠️ `bodyWeightKg` n'a nulle part où vivre aujourd'hui : aucune table ne
// suit le poids de corps (bodyweight tracking = V2). Le garde-fou
// `implausible_weight` reste donc inactif tant que cette donnée n'existe
// pas — comportement voulu par LLD §3.1 ("null si jamais renseigné"), pas
// un oubli.
export async function recordSetPRs(params: {
  profileId: string;
  exerciseId: string;
  setId: string;
  weightKg: number;
  reps: number;
}): Promise<CelebratedPR[]> {
  const { profileId, exerciseId, setId, weightKg, reps } = params;
  const { completedSets, sessionsLogged } = await loadExerciseHistory(profileId, exerciseId);

  // Le set qu'on vient de valider est déjà dans `completedSets` (son
  // `isCompleted` a été écrit avant cet appel) : il ne doit pas se comparer
  // à lui-même, sinon aucun set ne pourrait jamais battre un record.
  const previousSets = completedSets.filter((set) => set.id !== setId);
  const previousBests = computePreviousBests(previousSets);

  const detected = detectPRs({ weightKg, reps }, previousBests);
  if (detected.length === 0) return [];

  const achievedAt = new Date();
  const verdicts = detected.map((pr) => ({
    pr,
    ...evaluatePRSocialEligibility(
      { exerciseId, weightKg, reps, achievedAt },
      {
        bodyWeightKg: null,
        previousBestKg: previousBests.weightKg,
        sessionsLoggedOnExercise: sessionsLogged,
      },
    ),
  }));

  await database.write(async () => {
    await database.batch(
      ...verdicts.map(({ pr, isSocialEligible, reason }) =>
        database.get<PersonalRecord>('personal_records').prepareCreate((row) => {
          row.profileId = profileId;
          row.exerciseId = exerciseId;
          row.setId = setId;
          row.weightKg = weightKg;
          row.reps = reps;
          row.estimated1RmKg = estimatedOneRepMax(weightKg, reps);
          row.prType = pr.type;
          row.isSocialEligible = isSocialEligible;
          row.ineligibilityReason = reason;
          // La valeur était calculée par `detectPRs` puis perdue : elle ne
          // survivait qu'en mémoire, le temps d'afficher la modale de
          // célébration. Elle est désormais figée avec la ligne — même
          // statut que `isSocialEligible`, calculé à partir du même input.
          row.previousBest = pr.previousBest;
          row.achievedAt = achievedAt;
        }),
      ),
    );
  });

  // Un PR est écrit hors du `runWrite` de `use-active-workout.ts`, donc son
  // push doit être demandé ici — sinon il n'atteindrait le serveur qu'au
  // prochain déclencheur naturel (jusqu'à 3 min).
  requestSync('structural');

  return verdicts.map(({ pr, isSocialEligible, reason }) => ({
    type: pr.type,
    value: pr.value,
    previousBest: pr.previousBest,
    isSocialEligible,
    ineligibilityReason: reason,
  }));
}
