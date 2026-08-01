import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Identité stable de CET appareil — ROADMAP 3.6, DATA_MODEL §2.2. Générée
// une fois, persistée dans SecureStore (comme le JWT, `lib/supabase.ts`) —
// jamais régénérée tant que l'app n'est pas désinstallée, y compris à
// travers un sign-out : se déconnecter ne doit jamais faire perdre
// l'identité de l'appareil ni ses données locales WatermelonDB (voir
// `lib/sync/engine.ts`, `handleDeviceInactive`).
//
// ⚠️ Ne porte plus de contrainte "1 appareil actif si gratuit" depuis la
// révision du 2026-08-01 (multi-device simultané pour tous les tiers) —
// cette identité sert désormais à distinguer les appareils dans l'écran
// manuel "Mes appareils" (`app/settings/devices.tsx`) et à cibler une
// déconnexion volontaire (`lib/devices.ts`), plus à faire respecter une
// limite automatique.
const DEVICE_ID_KEY = 'lyxo-device-id';

let cached: string | null = null;

export async function getOrCreateDeviceId(): Promise<string> {
  if (cached) return cached;

  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }

  const generated = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);
  cached = generated;
  return generated;
}
