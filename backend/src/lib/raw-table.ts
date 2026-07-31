import type { getSupabaseAdmin } from './supabase-admin';

// Échappatoire de typage CIBLÉE (même compromis que `ws as any` dans
// `supabase-admin.ts`) : certaines colonnes/tables touchées par ROADMAP
// 3.2-3.6 (`local_id` sur workout_exercises/sets, `personal_records`
// entière, `device_id` sur `devices`) n'existent pas encore dans les types
// générés (`backend/src/types/supabase.ts`) — leurs migrations ne sont pas
// appliquées. Regénérer les types résoudra ceci une fois les migrations
// appliquées ; `db/schema.test.ts` (côté app) est le garde-fou qui
// rappellera de le faire avant que la dérive ne devienne invisible.
export function rawTable(admin: ReturnType<typeof getSupabaseAdmin>, name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (admin as any).from(name);
}
