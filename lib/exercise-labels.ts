// `exercises.muscle_group`/`equipment` stockent le slug canonique EN du
// dataset source (free-exercise-db) — pas de FR/EN séparé en base, cf.
// migration 20260723190000_create_exercises.sql. L'affichage passe par
// i18n (lib/i18n/{en,fr}.json, clé "exercises.muscle_groups"/"equipment").
// Certains slugs source contiennent espaces/tirets, invalides comme clé
// JSON imbriquée : cette table fait le pont vers une clé i18n valide.
const MUSCLE_GROUP_KEY_OVERRIDES: Record<string, string> = {
  'lower back': 'lower_back',
  'middle back': 'middle_back',
};

const EQUIPMENT_KEY_OVERRIDES: Record<string, string> = {
  'body only': 'body_only',
  'e-z curl bar': 'ez_curl_bar',
  'exercise ball': 'exercise_ball',
  'medicine ball': 'medicine_ball',
  'foam roll': 'foam_roll',
};

export function muscleGroupI18nKey(slug: string): string {
  return `exercises.muscle_groups.${MUSCLE_GROUP_KEY_OVERRIDES[slug] ?? slug}`;
}

export function equipmentI18nKey(slug: string): string {
  return `exercises.equipment.${EQUIPMENT_KEY_OVERRIDES[slug] ?? slug}`;
}
