import { Model, type Relation } from '@nozbe/watermelondb';
import { date, field, readonly, relation, text } from '@nozbe/watermelondb/decorators';

import type { WorkoutExercise } from './WorkoutExercise';

// DATA_MODEL §2.7 — table `sets`.
//
// Classe nommée `WorkoutSet` et non `Set` (l'arbre LLD §1 écrit `Set.ts`) :
// `Set` est un global JavaScript, déjà utilisé ailleurs dans le projet
// (`new Set(...)` dans `components/ExercisePicker.tsx`). Le nom de TABLE
// reste bien `sets` — seule la classe TS diffère, l'écart s'arrête là.
//
// ⚠️ Le CHECK serveur `rpe between 1 and 10` n'a pas d'équivalent
// WatermelonDB : c'est au code de le garantir (RPE sur 1-10, jamais en
// pourcentage — SECURITY_NOTES §2.2).
export class WorkoutSet extends Model {
  static table = 'sets';

  static associations = {
    workout_exercises: { type: 'belongs_to', key: 'workout_exercise_id' },
  } as const;

  @text('workout_exercise_id') workoutExerciseId: string;
  @field('set_number') setNumber: number;

  // CANONIQUE en kg (§19.15) — jamais de lbs stockés, quelle que soit
  // l'unité d'affichage. La conversion vit dans `lib/units.ts`.
  @field('weight_kg') weightKg: number;
  @field('reps') reps: number;
  @field('rpe') rpe: number | null;
  @field('is_completed') isCompleted: boolean;

  @date('deleted_at') deletedAt: Date | null;

  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;

  @relation('workout_exercises', 'workout_exercise_id')
  workoutExercise: Relation<WorkoutExercise>;
}
