import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import * as Sentry from '@sentry/react-native';

import { workoutMigrations } from './migrations';
import { PersonalRecord } from './models/PersonalRecord';
import { Workout } from './models/Workout';
import { WorkoutExercise } from './models/WorkoutExercise';
import { WorkoutSet } from './models/WorkoutSet';
import { workoutSchema } from './schema';

// Source de vérité OFFLINE (LLD.md §3, "db/") : aucun écran ne parle à l'API
// directement pour des données de séance — tout passe par ces models.
//
// `jsi: true` validé sur appareil Android réel sous New Architecture lors du
// spike du Point Ouvert #46 (commit 0950633) : c'était LE risque archi non
// vérifié du projet. Recette et pièges dans ARCHITECTURE.md #46.
const adapter = new SQLiteAdapter({
  schema: workoutSchema,
  // Indispensable : sans chemin de migration, un appareil déjà installé garde
  // son ancien schéma en silence quand `workoutSchema.version` change.
  migrations: workoutMigrations,
  jsi: true,
  onSetUpError: (error) => {
    // Une base illisible est irrécupérable côté UI : on ne peut ni la
    // réparer ni continuer silencieusement, mais on doit au moins le savoir.
    Sentry.captureException(error, { extra: { context: 'watermelondb_setup' } });
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Workout, WorkoutExercise, WorkoutSet, PersonalRecord],
});
