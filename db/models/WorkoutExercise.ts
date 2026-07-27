import { Model, type Query, type Relation } from '@nozbe/watermelondb';
import { children, date, field, readonly, relation, text } from '@nozbe/watermelondb/decorators';

import type { Workout } from './Workout';
import type { WorkoutSet } from './WorkoutSet';

// DATA_MODEL §2.6.
//
// ⚠️ Le CHECK serveur `exercise_id is not null or custom_exercise_id is not
// null` n'a PAS d'équivalent WatermelonDB : rien n'empêche localement
// d'écrire une ligne sans aucun des deux. C'est au code appelant de garantir
// l'invariant — sinon le push Phase 3 sera rejeté par Postgres pour une
// ligne déjà acceptée en local, et la sync partira en erreur sur une donnée
// déjà écrite.
export class WorkoutExercise extends Model {
  static table = 'workout_exercises';

  static associations = {
    workouts: { type: 'belongs_to', key: 'workout_id' },
    sets: { type: 'has_many', foreignKey: 'workout_exercise_id' },
  } as const;

  @text('workout_id') workoutId!: string;
  // Exactement un des deux est renseigné : référentiel `exercises` (§2.3) ou
  // exercice perso `custom_exercises` (§2.4).
  @text('exercise_id') exerciseId!: string | null;
  @text('custom_exercise_id') customExerciseId!: string | null;

  @field('order_index') orderIndex!: number;

  @date('deleted_at') deletedAt!: Date | null;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('workouts', 'workout_id') workout!: Relation<Workout>;
  @children('sets') sets!: Query<WorkoutSet>;
}
