import { Model } from '@nozbe/watermelondb';

// DATA_MODEL §2.7 — table `sets`.
//
// ⚠️ AUCUN DÉCORATEUR ICI, VOLONTAIREMENT (ROADMAP 2.6, 2026-07-27).
//
// Les décorateurs `@field`/`@date` de WatermelonDB exigent que Babel
// transforme les champs de classe APRÈS eux. Or Metro cible Hermes, qui
// supporte nativement les champs de classe : babel-preset-expo saute donc
// cette transformation, et le bundle contient
// `champ = _initializerWarningHelper(...)`, qui lève "Decorating class
// property failed" au runtime.
//
// Les trois contournements ont été testés et écartés :
//   - `class-properties` seul  -> casse RN ("Class private methods are not
//     enabled" sur PerformanceObserver.js / GlobalStateObserver.js) ;
//   - le trio en mode SPEC     -> compile, mais casse VirtualizedList au
//     runtime ("property is not configurable", @babel/runtime/defineProperty) ;
//   - le trio en mode LOOSE    -> écarté par le spike ("Cannot assign to
//     read-only property 'NONE'" dans Event.js) ;
//   - `overrides` limité aux models -> impossible, Metro appelle Babel sans
//     nom de fichier pour sa clé de cache et refuse tout motif `test`.
//
// Les décorateurs ne font de toute façon rien d'autre que définir un
// getter/setter autour de `_getRaw`/`_setRaw` (source :
// node_modules/@nozbe/watermelondb/decorators/field/index.js). On les écrit
// donc à la main : même comportement, zéro dépendance à la configuration
// Babel, et `babel.config.js` revient à la configuration validée par le spike.
//
// Classe nommée `WorkoutSet` et non `Set` (l'arbre LLD §1 écrit `Set.ts`) :
// `Set` est un global JavaScript déjà utilisé dans le projet. Le nom de TABLE
// reste bien `sets`.
//
// ⚠️ Le CHECK serveur `rpe between 1 and 10` n'a pas d'équivalent
// WatermelonDB : c'est au code de le garantir (SECURITY_NOTES §2.2).
export class WorkoutSet extends Model {
  static table = 'sets';

  static associations = {
    workout_exercises: { type: 'belongs_to', key: 'workout_exercise_id' },
  } as const;

  get workoutExerciseId(): string {
    return this._getRaw('workout_exercise_id') as string;
  }
  set workoutExerciseId(value: string) {
    this._setRaw('workout_exercise_id', value);
  }

  get setNumber(): number {
    return this._getRaw('set_number') as number;
  }
  set setNumber(value: number) {
    this._setRaw('set_number', value);
  }

  // CANONIQUE en kg (§19.15) — jamais de lbs stockés, quelle que soit l'unité
  // d'affichage. La conversion vit dans `lib/units.ts`.
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

  get rpe(): number | null {
    return this._getRaw('rpe') as number | null;
  }
  set rpe(value: number | null) {
    this._setRaw('rpe', value);
  }

  get isCompleted(): boolean {
    return this._getRaw('is_completed') as boolean;
  }
  set isCompleted(value: boolean) {
    this._setRaw('is_completed', value);
  }

  // Même sérialisation que le décorateur @date : epoch ms en base, Date en
  // mémoire, `null` propagé tel quel.
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
