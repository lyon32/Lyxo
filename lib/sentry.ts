import * as Sentry from '@sentry/react-native';

// No-op tant qu'aucun projet Sentry n'existe (DSN absent) — voir
// ENV_SETUP.md §1.1. À appeler avant le rendu du premier écran.
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({ dsn, environment: __DEV__ ? 'development' : 'production' });
}
