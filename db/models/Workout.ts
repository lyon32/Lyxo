import { Model, type Query } from '@nozbe/watermelondb';
import { children, date, field, readonly, text } from '@nozbe/watermelondb/decorators';

import type { WorkoutExercise } from './WorkoutExercise';

// DATA_MODEL §2.5. L'`id` WatermelonDB de ce record EST le `local_id` côté
// serveur (voir la table de correspondance de `db/schema.ts`) : c'est lui qui
// rend le push de sync idempotent via `uq_workout_local`.
export class Workout extends Model {
  static table = 'workouts';

  static associations = {
    workout_exercises: { type: 'has_many', foreignKey: 'workout_id' },
  } as const;

  @text('profile_id') profileId: string;
  @text('title') title: string | null;
  @text('program_id') programId: string | null;

  @date('started_at') startedAt: Date;
  // `null` tant que la séance est en cours — c'est ce champ qui distingue une
  // séance ouverte d'une séance terminée.
  @date('completed_at') completedAt: Date | null;

  @field('total_volume_kg') totalVolumeKg: number | null;
  @field('is_private') isPrivate: boolean;

  @date('deleted_at') deletedAt: Date | null;

  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;

  @children('workout_exercises') workoutExercises: Query<WorkoutExercise>;
}
