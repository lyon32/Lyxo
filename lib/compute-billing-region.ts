import { apiFetch } from './api-client';

// BILLING_FLOW.md §2 : billing_region est calculé et stocké côté serveur
// UNIQUEMENT (backend/src/routes/profiles.ts, PATCH .../billing-region) —
// jamais côté client, et "jamais recalculée en douce" après le premier
// calcul à l'inscription. Appelé UNE SEULE FOIS, depuis la soumission de
// l'écran 2bis (app/onboarding/onboarding-details.tsx, ROADMAP 1.8) — ne
// plus appeler sur chaque SIGNED_IN (ancienne simplification temporaire
// de la tâche 1.7, corrigée ici maintenant que ce vrai point de
// déclenchement existe).
export async function computeBillingRegion(declaredCountry?: string): Promise<Response> {
  return apiFetch('/v1/profiles/me/billing-region', {
    method: 'PATCH',
    body: JSON.stringify(declaredCountry ? { declared_country: declaredCountry } : {}),
  });
}
