import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';

import type { Model } from '@nozbe/watermelondb';

import { database } from '../../db/index';
import { apiFetch } from '../api-client';
import { resolveConflict, type SyncableRecord } from './conflict-resolution';
import { buildRawFromPulledRow, fetchChangedRows, SYNC_TABLES, type PulledRow, type SyncTableName } from './tables';

// Orchestration de la sync — ROADMAP 3.5. Les listeners globaux
// (AppState/NetInfo) vivent ICI, en singleton, jamais dans un composant
// (CONVENTIONS.md §5.8 : sinon listeners empilés à chaque remontage d'écran
// = sync déclenchée N fois, OOM silencieux sur device bas de gamme).
//
// ⚠️ PAS ENCORE BRANCHÉ AU BOOT DE L'APP (`app/_layout.tsx`) — décision
// délibérée : les migrations 3.1-3.3 ne sont pas appliquées sur la base
// `lyxo` réelle. Démarrer `startAutoSync()` maintenant ferait tourner ce
// moteur contre un backend qui rejetterait tout (colonnes/tables
// inexistantes), en boucle de retry pour rien. Le câblage au boot est une
// décision séparée, à prendre une fois les migrations appliquées.

const LAST_PUSHED_AT_KEY = 'lyxo-sync-last-pushed-at';
const LAST_PULLED_AT_KEY = 'lyxo-sync-last-pulled-at';

async function getCheckpoint(key: string): Promise<number> {
  const raw = await AsyncStorage.getItem(key);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setCheckpoint(key: string, value: number): Promise<void> {
  await AsyncStorage.setItem(key, String(value));
}

// --- retry / backoff ---------------------------------------------------------
// LLD.md ("AJOUT audit technique 2026-07-25") : 5xx/503/timeout réseau →
// retry avec backoff exponentiel borné, puis abandon SILENCIEUX jusqu'au
// prochain déclencheur naturel (retour réseau, prochain foreground) —
// jamais de boucle infinie qui viderait batterie/data. Une erreur 4xx
// (auth, validation) n'est PAS retryable : la rejouer 5 fois n'y changerait
// rien, seulement du bruit et de la batterie perdue pour rien.

const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000]; // 5 tentatives au total

class RetryableSyncError extends Error {}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(context: string, fn: () => Promise<T>): Promise<T | null> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
      const retryable = error instanceof RetryableSyncError;
      if (!retryable || isLastAttempt) {
        Sentry.captureException(error, { extra: { context, attempt, retryable } });
        return null;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  return null;
}

async function syncFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch (networkError) {
    // Coupure réseau / DNS mort (mode avion, timeout) : retryable.
    throw new RetryableSyncError(`network error: ${(networkError as Error).message}`);
  }

  if (response.status >= 500 || response.status === 503) {
    throw new RetryableSyncError(`sync request failed with status ${response.status}`);
  }
  if (!response.ok) {
    // 4xx : pas la peine de retenter, ça ne changera pas de résultat.
    const body = await response.text().catch(() => '');
    throw new Error(`sync request rejected with status ${response.status}: ${body}`);
  }
  return (await response.json()) as T;
}

// --- push --------------------------------------------------------------------
// Toujours via `created` (upsert idempotent côté serveur), jamais `updated` :
// le client n'a aucun moyen fiable de savoir si une ligne existe déjà côté
// serveur sans un aller-retour, et l'upsert traite les deux cas de façon
// identique et sûre au rejeu (index unique scopé au parent, ROADMAP 3.3).
// Distinguer créé/modifié côté client n'apporterait rien au serveur.
async function buildPushChanges(sinceEpochMs: number) {
  const changes: Partial<
    Record<SyncTableName, { created: unknown[]; updated: never[]; deleted: string[] }>
  > = {};

  for (const table of SYNC_TABLES) {
    const { created, deletedLocalIds } = await fetchChangedRows(table, sinceEpochMs);
    if (created.length === 0 && deletedLocalIds.length === 0) continue;
    changes[table] = { created, updated: [], deleted: deletedLocalIds };
  }
  return changes;
}

async function pushOnce(): Promise<void> {
  const lastPushedAt = await getCheckpoint(LAST_PUSHED_AT_KEY);
  // Capturé AVANT de construire la requête : une écriture locale survenant
  // PENDANT l'appel réseau doit rester "non poussée" au prochain cycle,
  // jamais couverte à tort parce que le checkpoint aurait avancé après coup
  // (LLD.md point 3 : le checkpoint n'avance que sur accusé confirmé — la
  // même règle s'applique à la fenêtre qu'il couvre).
  const syncStartedAt = Date.now();

  const changes = await buildPushChanges(lastPushedAt);
  if (Object.keys(changes).length === 0) {
    await setCheckpoint(LAST_PUSHED_AT_KEY, syncStartedAt);
    return;
  }

  const result = await withRetry('sync_push', () =>
    syncFetchJson('/v1/sync/push', { method: 'POST', body: JSON.stringify({ changes }) }),
  );
  // Échec après épuisement des tentatives : le checkpoint n'avance PAS,
  // ces changements seront repoussés au prochain cycle (LLD point 4,
  // "rejouer le batch non accusé à l'identique" — sûr grâce à l'idempotence
  // par `local_id`, ROADMAP 3.3).
  if (result === null) return;

  await setCheckpoint(LAST_PUSHED_AT_KEY, syncStartedAt);
}

// --- pull --------------------------------------------------------------------

interface PullResponse {
  data: Partial<Record<SyncTableName, PulledRow[]>>;
  next_cursor: string | null;
  has_more: boolean;
  server_timestamp: string;
}

async function applyPulledTable(table: SyncTableName, rows: PulledRow[]): Promise<void> {
  if (rows.length === 0) return;

  const collection = database.get(table);
  const operations: Model[] = [];

  interface FoundRecord {
    updatedAt: Date | null;
    deletedAt: Date | null;
    _setRaw: (key: string, value: unknown) => void;
    prepareUpdate: (updater: () => void) => Model;
  }

  for (const row of rows) {
    let existingRecord: FoundRecord | null = null;
    try {
      existingRecord = (await collection.find(row.local_id)) as unknown as FoundRecord;
    } catch {
      existingRecord = null;
    }

    const remote: SyncableRecord = {
      id: row.local_id,
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    };

    if (!existingRecord) {
      // Une entité supprimée qu'on n'a jamais vue localement n'a rien à
      // matérialiser — pas la peine de créer une tombe locale pour rien.
      if (remote.deletedAt) continue;

      const raw = buildRawFromPulledRow(table, row);
      operations.push(collection.prepareCreateFromDirtyRaw({ id: row.local_id, ...raw }));
      continue;
    }

    const local: SyncableRecord = {
      id: row.local_id,
      updatedAt: existingRecord.updatedAt ?? new Date(0),
      deletedAt: existingRecord.deletedAt,
    };
    const winner = resolveConflict(local, remote);
    if (winner !== remote) continue; // le local est déjà au moins aussi récent : rien à faire

    const raw = buildRawFromPulledRow(table, row);
    operations.push(
      existingRecord.prepareUpdate(() => {
        for (const [key, value] of Object.entries(raw)) {
          existingRecord!._setRaw(key, value);
        }
      }),
    );
  }

  if (operations.length > 0) {
    await database.write(async () => {
      await database.batch(...operations);
    });
  }
}

async function pullOnce(): Promise<void> {
  const lastPulledAt = await getCheckpoint(LAST_PULLED_AT_KEY);
  const since = new Date(lastPulledAt).toISOString();
  const tablesParam = SYNC_TABLES.join(',');

  let cursor: string | null = null;
  let latestServerTimestamp: string | null = null;

  while (true) {
    const query = new URLSearchParams({ tables: tablesParam, since, limit: '500' });
    if (cursor) query.set('cursor', cursor);

    const page = await withRetry('sync_pull', () =>
      syncFetchJson<PullResponse>(`/v1/sync/pull?${query.toString()}`),
    );
    // Échec après épuisement des tentatives : abandon de CE cycle de pull.
    // Le checkpoint n'a pas bougé, donc rien n'est perdu — juste reporté.
    if (page === null) return;

    for (const table of SYNC_TABLES) {
      const rows = page.data[table];
      if (rows && rows.length > 0) {
        await applyPulledTable(table, rows);
      }
    }

    latestServerTimestamp = page.server_timestamp;
    if (!page.has_more) break;
    cursor = page.next_cursor;
    if (!cursor) break; // has_more=true sans curseur serait une réponse serveur incohérente
  }

  // Le checkpoint n'avance QUE si toute la pagination est allée jusqu'au
  // bout (`has_more: false`) — API_SPEC §4.1 définit UNE pagination pour
  // TOUTES les tables demandées ensemble, pas un curseur par table : une
  // interruption à mi-parcours laisserait par ex. des `sets` avancés sans
  // leurs `workouts` parents si on avançait un checkpoint partiel.
  if (latestServerTimestamp) {
    await setCheckpoint(LAST_PULLED_AT_KEY, new Date(latestServerTimestamp).getTime());
  }
}

// --- cycle complet + déclencheurs --------------------------------------------

let syncing = false;

// Push d'abord (les changements locaux partent avant qu'on n'incorpore des
// données distantes), puis pull. Les deux étapes gèrent leur propre retry
// et abandonnent indépendamment — un push qui échoue après ses tentatives
// n'empêche pas un pull de profiter quand même du réseau redevenu
// disponible.
export async function syncNow(): Promise<void> {
  if (syncing) return; // un cycle déjà en cours : pas de doublon concurrent
  syncing = true;
  try {
    await pushOnce();
    await pullOnce();
  } finally {
    syncing = false;
  }
}

let started = false;
let removeAppStateListener: (() => void) | null = null;
let removeNetInfoListener: (() => void) | null = null;

// Déclencheurs "naturels" (LLD §3.2/CONVENTIONS §5.8) : retour au premier
// plan et retour réseau. Singleton — appeler deux fois est un no-op, pas un
// double enregistrement de listener.
export function startAutoSync(): void {
  if (started) return;
  started = true;

  const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') void syncNow();
  });
  removeAppStateListener = () => appStateSub.remove();

  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    if (state.isConnected) void syncNow();
  });
  removeNetInfoListener = unsubscribeNetInfo;
}

export function stopAutoSync(): void {
  removeAppStateListener?.();
  removeNetInfoListener?.();
  removeAppStateListener = null;
  removeNetInfoListener = null;
  started = false;
}
