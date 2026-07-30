import { Model } from '@nozbe/watermelondb';

import type { IneligibilityReason, PRType } from '../../lib/pr-detection';

// DATA_MODEL §2.8 — table `personal_records`.
//
// ⚠️ Aucun décorateur — même raison qu'ailleurs dans `db/models/` (voir
// `WorkoutSet.ts`) : Hermes saute la transformation Babel des décorateurs de
// champs de classe, ce qui lève "Decorating class property failed" au
// runtime. Getters/setters écrits à la main autour de `_getRaw`/`_setRaw`,
// même comportement, zéro dépendance à la config Babel.
//
// ⚠️ Le CHECK serveur `pr_type in ('weight','volume','reps','1rm')` n'a pas
// d'équivalent WatermelonDB : c'est au code appelant (`db/pr-recording.ts`)
// de ne jamais écrire autre chose que les valeurs de `PRType`.
export class PersonalRecord extends Model {
  static table = 'personal_records';

  static associations = {
    exercises: { type: 'belongs_to', key: 'exercise_id' },
    sets: { type: 'belongs_to', key: 'set_id' },
  } as const;

  get profileId(): string {
    return this._getRaw('profile_id') as string;
  }
  set profileId(value: string) {
    this._setRaw('profile_id', value);
  }

  get exerciseId(): string {
    return this._getRaw('exercise_id') as string;
  }
  set exerciseId(value: string) {
    this._setRaw('exercise_id', value);
  }

  get setId(): string | null {
    return this._getRaw('set_id') as string | null;
  }
  set setId(value: string | null) {
    this._setRaw('set_id', value);
  }

  // CANONIQUE en kg (§19.15), même valeur pour les 4 types de PR : c'est le
  // set réel qui a déclenché le record, jamais une valeur dérivée stockée
  // séparément. Pour `pr_type = 'volume'`, le volume se recalcule à la
  // lecture (`weightKg * reps`) plutôt que d'exister comme colonne propre.
  get weightKg(): number {
    return this._getRaw('weight_kg') as number;
  }
  set weightKg(value: number) {
    this._setRaw('weight_kg', value);
  }

  get reps(): number {
    return this._getRaw('reps') as number;
  }
  set reps(value: number) {
    this._setRaw('reps', value);
  }

  get estimated1RmKg(): number | null {
    return this._getRaw('estimated_1rm_kg') as number | null;
  }
  set estimated1RmKg(value: number | null) {
    this._setRaw('estimated_1rm_kg', value);
  }

  get prType(): PRType {
    return this._getRaw('pr_type') as PRType;
  }
  set prType(value: PRType) {
    this._setRaw('pr_type', value);
  }

  // Anti-triche §18.1 : le PR reste vrai pour son auteur (stats perso
  // intactes) — ces deux champs décident seulement de sa visibilité aux
  // autres (leaderboard/Conquête/Trace).
  get isSocialEligible(): boolean {
    return this._getRaw('is_social_eligible') as boolean;
  }
  set isSocialEligible(value: boolean) {
    this._setRaw('is_social_eligible', value);
  }

  get ineligibilityReason(): IneligibilityReason {
    return this._getRaw('ineligibility_reason') as IneligibilityReason;
  }
  set ineligibilityReason(value: IneligibilityReason) {
    this._setRaw('ineligibility_reason', value);
  }

  get achievedAt(): Date | null {
    const raw = this._getRaw('achieved_at');
    return typeof raw === 'number' ? new Date(raw) : null;
  }
  set achievedAt(value: Date | null) {
    this._setRaw('achieved_at', value ? +new Date(value) : null);
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
