// Mapping Supabase → UX (UI prompt écran 3ter). Le message brut Supabase
// n'est jamais affiché tel quel — toujours un des messages produit
// définis dans i18n.
export type AuthErrorKind =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'weak_password'
  | 'offline'
  | 'generic';

export function mapAuthError(error: unknown): AuthErrorKind {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch')
  ) {
    return 'offline';
  }
  if (message.includes('invalid login credentials')) {
    return 'invalid_credentials';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'user_already_exists';
  }
  if (message.includes('password') && (message.includes('short') || message.includes('least'))) {
    return 'weak_password';
  }

  return 'generic';
}
