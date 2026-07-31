import { getOrCreateDeviceId } from './device-id';
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Client HTTP minimal vers le backend LYXO — attache le JWT Supabase de
// la session courante (API_SPEC.md §1, "Authorization: Bearer <jwt>") et
// l'identité de l'appareil (ROADMAP 3.6, `X-Device-Id`). Attaché à CHAQUE
// appel plutôt que seulement sur les routes qui le vérifient aujourd'hui
// (`GET /v1/sync/pull`) : l'en-tête est inoffensif pour les routes qui
// l'ignorent, et une future route qui l'exigerait n'aura rien à changer
// côté client.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const deviceId = await getOrCreateDeviceId();

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Device-Id', deviceId);
  if (session) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
