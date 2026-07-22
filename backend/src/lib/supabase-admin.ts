import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../types/supabase';

// Service role : bypass RLS, backend uniquement (jamais exposé au client
// — SUPABASE_SERVICE_ROLE_KEY, voir ENV_SETUP.md §1.2). Créé paresseusement
// pour que le serveur boote (healthcheck compris) même sans cette clé —
// seules les routes qui en ont besoin échouent tant qu'elle n'est pas
// configurée (même logique que Sentry, lib/sentry.ts).
let client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured.');
  }

  client = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
