import { Model } from '@nozbe/watermelondb';

// DATA_MODEL §2.5. L'`id` WatermelonDB de ce record EST le `local_id` côté
// serveur (voir la table de correspondance de `db/schema.ts`) : c'est lui qui
// rend le push de sync idempotent via `uq_workout_local`.
//
// ⚠️ Aucun décorateur — raison détaillée en tête de `db/models/WorkoutSet.ts`
// (incompatibilité Hermes/Babel, quatre contournements testés et écartés).
export class Workout extends Model {
  static table = 'workouts';

  static associations = {
    workout_exercises: { type: 'has_many', foreignKey: 'workout_id' },
  } as const;

  get profileId(): string {
    return this._getRaw('profile_id') as string;
  }
  set profileId(value: string) {
    this._setRaw('profile_id', value);
  }

  get title(): string | null {
    return this._getRaw('title') as string | null;
  }
  set title(value: string | null) {
    this._setRaw('title', value);
  }

  get programId(): string | null {
    return this._getRaw('program_id') as string | null;
  }
  set programId(value: string | null) {
    this._setRaw('program_id', value);
  }

  get startedAt(): Date | null {
    const raw = this._getRaw('started_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }
  set startedAt(value: Date | null) {
    this._setRaw('started_at', value ? +new Date(value) : null);
  }

  // `null` tant que la séance est en cours — c'est ce champ, et lui seul, qui
  // distingue une séance ouverte d'une séance terminée.
  get completedAt(): Date | null {
    const raw = this._getRaw('completed_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }
  set completedAt(value: Date | null) {
    this._setRaw('completed_at', value ? +new Date(value) : null);
  }

  get totalVolumeKg(): number | null {
    return this._getRaw('total_volume_kg') as number | null;
  }
  set totalVolumeKg(value: number | null) {
    this._setRaw('total_volume_kg', value);
  }

  get isPrivate(): boolean {
    return this._getRaw('is_private') as boolean;
  }
  set isPrivate(value: boolean) {
    this._setRaw('is_private', value);
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
