import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import * as Sentry from '@sentry/react-native';

import { database } from './index';
import type { PersonalRecord } from './models/PersonalRecord';
import type { Workout } from './models/Workout';
import type { WorkoutExercise } from './models/WorkoutExercise';
import type { WorkoutSet } from './models/WorkoutSet';
import type { CelebratedPR } from './pr-recording';

// Données du résumé peak-end (ROADMAP 2.11, LYXO_UI_PROMPT §5bis) : volume
// total + delta vs la séance précédente, stats compactes, PR de la séance.
// Un PR de séance porte son `exerciseId` : une séance touche souvent
// plusieurs exercices, contrairement à la célébration (2.10) qui ne
// concerne qu'un seul exercice à la fois.
export interface SessionPR extends CelebratedPR {
  exerciseId: string;
}

export interface WorkoutSummaryView {
  workoutId: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  totalVolumeKg: number;
  previousVolumeKg: number | null;
  setsCount: number;
  exercisesCount: number;
  prs: SessionPR[];
}

// Séance la plus récente TERMINÉE avant celle-ci — sert de comparaison au
// delta du hero. §2.7 (Templates/Splits) ayant été abandonné, il n'existe
// plus de notion de "même séance" à comparer : la précédente tout court est
// la comparaison la plus proche de l'intention du mockup.
async function loadPreviousVolumeKg(profileId: string, beforeWorkoutId: string): Promise<number | null> {
  const rows = await database
    .get<Workout>('workouts')
    .query(
      Q.where('profile_id', profileId),
      Q.where('deleted_at', null),
      Q.where('completed_at', Q.notEq(null)),
      Q.where('id', Q.notEq(beforeWorkoutId)),
      Q.sortBy('completed_at', Q.desc),
      Q.take(1),
    )
    .fetch();
  return rows[0]?.totalVolumeKg ?? null;
}

async function loadSummary(workoutId: string): Promise<WorkoutSummaryView | null> {
  const workout = await database.get<Workout>('workouts').find(workoutId);
  if (!workout.completedAt || !workout.startedAt) return null;

  const workoutExercises = await database
    .get<WorkoutExercise>('workout_exercises')
    .query(Q.where('workout_id', workoutId), Q.where('deleted_at', null))
    .fetch();

  const sets = await database
    .get<WorkoutSet>('sets')
    .query(
      Q.where('workout_exercise_id', Q.oneOf(workoutExercises.map((we) => we.id))),
      Q.where('is_completed', true),
      Q.where('deleted_at', null),
    )
    .fetch();

  const records =
    sets.length === 0
      ? []
      : await database
          .get<PersonalRecord>('personal_records')
          .query(Q.where('set_id', Q.oneOf(sets.map((s) => s.id))), Q.where('deleted_at', null))
          .fetch();

  const profileId = workout.profileId;
  const previousVolumeKg = await loadPreviousVolumeKg(profileId, workoutId);

  return {
    workoutId,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    durationMs: workout.completedAt.getTime() - workout.startedAt.getTime(),
    totalVolumeKg: workout.totalVolumeKg ?? 0,
    previousVolumeKg,
    setsCount: sets.length,
    exercisesCount: workoutExercises.length,
    prs: records.map((record) => ({
      exerciseId: record.exerciseId,
      type: record.prType,
      value:
        record.prType === 'reps'
          ? record.reps
          : record.prType === 'volume'
            ? record.weightKg * record.reps
            : record.prType === '1rm'
              ? (record.estimated1RmKg ?? record.weightKg)
              : record.weightKg,
      // Le "record battu" n'est pas reconstruit ici (nécessiterait de rejouer
      // l'historique) : le résumé de séance affiche la valeur atteinte, pas
      // le delta — seule la carte de célébration (2.10), affichée au moment
      // exact du record, porte le delta.
      previousBest: null,
      isSocialEligible: record.isSocialEligible,
      ineligibilityReason: record.ineligibilityReason,
    })),
  };
}

// `loadedForId` (et non un simple booléen `ready`) : le seul `setState`
// synchrone dans le corps de l'effet serait lui-même l'anomalie que
// react-hooks/set-state-in-effect signale. En ne posant l'état QUE depuis le
// callback asynchrone, "prêt" se déduit par comparaison au rendu plutôt que
// d'être écrit deux fois (avant et après le chargement).
export function useWorkoutSummary(workoutId: string | null) {
  const [state, setState] = useState<{ loadedForId: string | null; summary: WorkoutSummaryView | null }>(
    { loadedForId: null, summary: null },
  );

  useEffect(() => {
    if (!workoutId) return;
    let cancelled = false;

    // Les QUATRE tables lues par `loadSummary` sont dans `SYNC_TABLES`
    // (lib/sync/tables.ts) : une sync peut donc les écrire pendant que cet
    // écran est ouvert — et c'est un écran terminal, sur lequel
    // l'utilisateur reste. Avant ce passage en réactif, un PR calculé sur un
    // second appareil arrivait en base sans jamais s'afficher.
    //
    // `withChangesForTables` émet immédiatement (`startWith(null)`), donc ce
    // seul callback couvre aussi le chargement initial — pas de `setState`
    // synchrone dans le corps de l'effet (même raison qu'en tête de fichier).
    //
    // ⚠️ Observateur en LECTURE SEULE. Ne jamais y brancher d'écriture ni de
    // `requestSync` : la sync écrit elle-même dans ces tables en appliquant
    // un pull, ce qui boucle à l'infini (contrainte détaillée dans
    // `use-active-workout.ts`).
    //
    // Pas de coalescing : un pull touchant les 4 tables émet jusqu'à 4 fois,
    // soit ≤20 lectures SQLite indexées sur UNE séance — de l'ordre de la
    // milliseconde. À revisiter seulement si cet écran devient atteignable
    // pendant une PREMIÈRE sync (import massif d'historique) ; aujourd'hui on
    // n'y arrive qu'après avoir terminé une séance.
    const subscription = database
      .withChangesForTables(['workouts', 'workout_exercises', 'sets', 'personal_records'])
      .subscribe(() => {
        if (cancelled) return;
        loadSummary(workoutId)
          .then((next) => {
            if (cancelled) return;
            setState({ loadedForId: workoutId, summary: next });
          })
          .catch((error: unknown) => {
            // `loadSummary` commence par un `.find()` qui REJETTE si la ligne
            // n'existe pas. Sans ce catch : spinner infini au montage, et en
            // réactif d'anciennes données figées à l'écran plus une promesse
            // rejetée non gérée. On retombe sur l'écran nu "Terminer".
            if (cancelled) return;
            Sentry.captureException(error, { extra: { context: 'workout_summary_load', workoutId } });
            setState({ loadedForId: workoutId, summary: null });
          });
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [workoutId]);

  if (!workoutId) return { summary: null, ready: true };
  const ready = state.loadedForId === workoutId;
  return { summary: ready ? state.summary : null, ready };
}
