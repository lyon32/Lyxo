import { apiFetch } from './api-client';

// BILLING_FLOW.md §2 : billing_region est calculé et stocké côté serveur
// UNIQUEMENT (backend/src/routes/profiles.ts, PATCH .../billing-region) —
// jamais côté client. Pas encore de pays DÉCLARÉ ici (l'écran country
// picker arrive à la tâche 1.8) : pour l'instant le backend retombe sur
// le seul signal IP. Idempotent en pratique (même IP → même résultat)
// tant qu'aucun pays déclaré n'existe encore à pousser.
export async function computeBillingRegion(): Promise<void> {
  await apiFetch('/v1/profiles/me/billing-region', {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
