import { EMBEDDED_EXERCISE_IMAGES } from '../assets/exercises/embedded-images.generated';
import type { Exercise } from './exercises-store';

// Aperçu statique bundlé du pack embarqué (ROADMAP 2.1) : disponible
// hors-ligne et sans consommer de data, contrairement au gif_url distant.
// Retourne le module asset local si l'exercice fait partie du pack, sinon
// null. Voir backend/scripts/generate-embedded-thumbs.ts.
export function embeddedThumbFor(exercise: Pick<Exercise, 'external_id'>): number | null {
  if (!exercise.external_id) return null;
  return EMBEDDED_EXERCISE_IMAGES[exercise.external_id] ?? null;
}
