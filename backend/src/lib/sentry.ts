import * as Sentry from '@sentry/node';

// No-op tant que SENTRY_DSN n'est pas fourni (pas de projet Sentry créé
// pour l'instant — voir ENV_SETUP.md §1.2). À appeler avant tout le reste.
export function initSentry(): void {
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    // Pas d'IP/cookies/corps de requête auto-envoyés — posture RGPD du
    // projet (SECURITY_NOTES §3ter), le logger pino redacte déjà PII.
    sendDefaultPii: false,
  });
}
