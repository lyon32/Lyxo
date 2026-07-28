import { Model } from '@nozbe/watermelondb';

// DATA_MODEL §2.6.
//
// ⚠️ Aucun décorateur — raison détaillée en tête de `db/models/WorkoutSet.ts`
// (incompatibilité Hermes/Babel, quatre contournements testés et écartés).
//
// ⚠️ Le CHECK serveur `exercise_id is not null or custom_exercise_id is not
// null` n'a PAS d'équivalent WatermelonDB : rien n'empêche localement
// d'écrire une ligne sans aucun des deux. C'est au code appelant de garantir
// l'invariant — sinon le push Phase 3 sera rejeté par Postgres pour une ligne
// déjà acceptée en local, et la sync partira en erreur sur une donnée déjà
// écrite.
export class WorkoutExercise extends Model {
  static table = 'workout_exercises';

  static associations = {
    workouts: { type: 'belongs_to', key: 'workout_id' },
    sets: { type: 'has_many', foreignKey: 'workout_exercise_id' },
  } as const;

  get workoutId(): string {
    return this._getRaw('workout_id') as string;
  }
  set workoutId(value: string) {
    this._setRaw('workout_id', value);
  }

  // Exactement un des deux est renseigné : référentiel `exercises` (§2.3) ou
  // exercice perso `custom_exercises` (§2.4).
  get exerciseId(): string | null {
    return this._getRaw('exercise_id') as string | null;
  }
  set exerciseId(value: string | null) {
    this._setRaw('exercise_id', value);
  }

  get customExerciseId(): string | null {
    return this._getRaw('custom_exercise_id') as string | null;
  }
  set customExerciseId(value: string | null) {
    this._setRaw('custom_exercise_id', value);
  }

  get orderIndex(): number {
    return this._getRaw('order_index') as number;
  }
  set orderIndex(value: number) {
    this._setRaw('order_index', value);
  }

  get deletedAt(): Date | null {
    const raw = this._getRaw('deleted_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }
  set deletedAt(value: Date | null) {
    this._setRaw('deleted_at', value ? +new Date(value) : null);
  }

  get createdAt(): Date | null {
    const raw = this._getRaw('created_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }

  get updatedAt(): Date | null {
    const raw = this._getRaw('updated_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }
}
