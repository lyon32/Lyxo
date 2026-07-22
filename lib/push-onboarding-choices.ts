import { apiFetch } from './api-client';
import {
  clearOnboardingChoices,
  getOnboardingGoal,
  getOnboardingSplit,
  OnboardingSplit,
} from './onboarding-storage';

// Défaut par split (DATA_MODEL.md §2.1, commentaire weekly_goal) —
// modifiable ensuite dans Paramètres.
const WEEKLY_GOAL_BY_SPLIT: Record<OnboardingSplit, number> = {
  ppl: 3,
  upper_lower: 4,
  full_body: 3,
  custom: 3,
};

// API_SPEC.md §4.2 — après le PREMIER login de TOUT provider, pousse les
// choix pré-auth stockés en AsyncStorage. No-op si déjà poussés (rien à
// lire) — appelé sur CHAQUE 'SIGNED_IN', idempotent par construction.
export async function pushOnboardingChoicesIfAny(): Promise<void> {
  const [goal, split] = await Promise.all([getOnboardingGoal(), getOnboardingSplit()]);
  if (!goal && !split) return;

  const body: Record<string, unknown> = {};
  if (goal) body.goal = goal;
  if (split) {
    body.preferred_split = split;
    body.weekly_goal = WEEKLY_GOAL_BY_SPLIT[split];
  }

  const response = await apiFetch('/v1/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (response.ok) {
    await clearOnboardingChoices();
  }
}
