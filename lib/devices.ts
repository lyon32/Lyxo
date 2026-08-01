import { apiFetch } from './api-client';

// Écran "Mes appareils" (gestion manuelle, ROADMAP 3.6 révision
// 2026-08-01) — la déconnexion d'un appareil n'est plus automatique au
// login (multi-device simultané pour tous les tiers), elle passe par cet
// écran, une action volontaire de l'utilisateur.

export interface DeviceRecord {
  device_id: string;
  device_name: string | null;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
}

export async function fetchDevices(): Promise<DeviceRecord[]> {
  const response = await apiFetch('/v1/devices');
  if (!response.ok) {
    throw new Error(`fetchDevices failed: ${response.status}`);
  }
  const body = (await response.json()) as { devices: DeviceRecord[] };
  return body.devices;
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  const response = await apiFetch(`/v1/devices/${encodeURIComponent(deviceId)}/disconnect`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`disconnectDevice failed: ${response.status}`);
  }
}

export type RelativeTimeUnit = 'now' | 'minutes' | 'hours' | 'days';

export interface RelativeTime {
  unit: RelativeTimeUnit;
  count: number;
}

// Retourne une unité + un compte plutôt qu'une chaîne toute faite : la
// pluralisation FR/EN (1 min vs 2 min, 1 jour vs 2 jours) reste au niveau
// d'i18next (clés `_one`/`_other`, même convention que
// `workout.active.counter_sets_one/_other`) — jamais codée en dur ici.
// Paliers grossiers volontairement (pas de "il y a 3 min 12 s") : cet
// écran affiche une activité de session, pas un chrono de précision.
export function relativeTimeFrom(iso: string, now: number = Date.now()): RelativeTime {
  const deltaMs = now - new Date(iso).getTime();
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 1) return { unit: 'now', count: 0 };
  if (minutes < 60) return { unit: 'minutes', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: 'hours', count: hours };
  const days = Math.floor(hours / 24);
  return { unit: 'days', count: days };
}
