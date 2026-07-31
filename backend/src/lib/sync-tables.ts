// Tables réellement synchronisables via `/v1/sync/pull` (API_SPEC.md §4.1) —
// DATA_MODEL.md §2 tague `profiles` et `custom_exercises` [SYNC] aussi, mais
// aucune des deux n'a de modèle WatermelonDB côté client aujourd'hui
// (`profiles` passe par `/v1/profiles/me`, `custom_exercises` est lu en
// direct par `ExercisePicker.tsx`) : les inclure ici ouvrirait un chemin
// jamais exercé par le client, impossible à tester honnêtement. À étendre
// quand elles auront un consommateur WatermelonDB réel.
export const SYNC_TABLES = [
  'workouts',
  'workout_exercises',
  'sets',
  'personal_records',
  'exercises',
] as const;

export type SyncTableName = (typeof SYNC_TABLES)[number];

export function isSyncTableName(value: string): value is SyncTableName {
  return (SYNC_TABLES as readonly string[]).includes(value);
}
