import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';

import type { Model } from '@nozbe/watermelondb';

import { database } from '../../db/index';
import { apiFetch } from '../api-client';
import { supabase } from '../supabase';
import { resolveConflict, type SyncableRecord } from './conflict-resolution';
import {
  buildRawFromPulledRow,
  fetchChangedRows,
  prunePullEcho,
  rememberPulledRows,
  SYNC_TABLES,
  type PulledRow,
  type SyncTableName,
} from './tables';

// Orchestration de la sync — ROADMAP 3.5. Les listeners globaux
// (AppState/NetInfo) vivent ICI, en singleton, jamais dans un composant
// (CONVENTIONS.md §5.8 : sinon listeners empilés à chaque remontage d'écran
// = sync déclenchée N fois, OOM silencieux sur device bas de gamme).
//
// Branché au boot de l'app (`app/_layout.tsx`) depuis que les migrations
// 3.1-3.6 sont appliquées sur la base `lyxo`. (Le commentaire précédent
// affirmait le contraire — corrigé le 2026-08-01.)
//
// DÉCLENCHEURS D'UN CYCLE, liste exhaustive :
//   1. retour au premier plan (AppState 'active') ;
//   2. retour réseau (NetInfo isConnected) ;
//   3. minuterie périodique — `PERIODIC_SYNC_INTERVAL_MS`, le plancher ;
//   4. un appel immédiat au démarrage (un cold start n'émet aucune
//      transition 'active') ;
//   5. `requestSync()` après une écriture locale de l'utilisateur ;
//   6. la cadence rapide de `acquireFastSync()`, pendant une séance active.
//
// Les déclencheurs 5 et 6 ont été ajoutés le 2026-08-01 : sans eux, une
// écriture locale n'atteignait le serveur qu'à la minuterie suivante, soit
// jusqu'à 3 min — plus 3 min pour que l'autre appareil la tire. Un exercice
// ajouté mettait donc jusqu'à 6 minutes à apparaître sur le second
// téléphone du même compte, et ne semblait instantané qu'après un
// redémarrage complet (déclencheur 4). Bug constaté sur appareil.

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
    // Revérifié à CHAQUE tentative, pas seulement avant la première : le
    // check fait par `syncNow()` peut lire un état NetInfo pas encore à
    // jour au moment exact où le réseau tombe (course observée sur
    // appareil le 2026-08-01 — `isConnected` encore `true` en cache
    // pendant qu'un événement `false` vient tout juste d'être émis). Sans
    // cette revérification, un cycle démarré juste avant la coupure allait
    // quand même jusqu'au bout de ses 5 tentatives + backoff.
    if (attempt > 0) {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        // eslint-disable-next-line no-console
        console.log(`[sync] ${context} abandon : réseau coupé pendant les tentatives`);
        return null;
      }
    }

    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
      const retryable = error instanceof RetryableSyncError;
      // eslint-disable-next-line no-console
      console.log(`[sync] ${context} error (attempt ${attempt}, retryable=${retryable}):`, error);
      if (!retryable || isLastAttempt) {
        // `DeviceInactiveError` est un flux métier attendu (un autre
        // appareil a pris la place, ROADMAP 3.6), pas un bug — le signaler
        // à Sentry ne ferait que polluer le suivi d'erreurs réelles.
        if (!(error instanceof DeviceInactiveError)) {
          Sentry.captureException(error, { extra: { context, attempt, retryable } });
        }
        return null;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
  return null;
}

// ROADMAP 3.6 : quand un autre appareil devient l'appareil actif (gratuit),
// `GET /v1/sync/pull` répond 403 `{reason: 'device_inactive'}`. Le
// sign-out efface UNIQUEMENT la session Supabase (SecureStore) — jamais
// WatermelonDB. Un coach qui a des séances loggées non encore poussées sur
// cet appareil ne doit RIEN perdre : `stopAutoSync()` arrête juste les
// déclencheurs, la base locale reste intacte et repart en sync à la
// prochaine connexion sur ce même appareil (`device_id` stable en
// SecureStore, voir `lib/device-id.ts`).
async function handleDeviceInactive(): Promise<void> {
  stopAutoSync();
  await supabase.auth.signOut();
}

export class DeviceInactiveError extends Error {}

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
    const body = await response.json().catch(() => null);
    if (response.status === 403 && body?.error?.details?.reason === 'device_inactive') {
      await handleDeviceInactive();
      throw new DeviceInactiveError('device deactivated by another login');
    }
    // 4xx (hors device_inactive) : pas la peine de retenter, ça ne
    // changera pas de résultat.
    throw new Error(`sync request rejected with status ${response.status}: ${JSON.stringify(body)}`);
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
  // eslint-disable-next-line no-console
  console.log(
    '[sync] push: lastPushedAt=',
    new Date(lastPushedAt).toISOString(),
    'tables=',
    Object.keys(changes),
    Object.fromEntries(
      Object.entries(changes).map(([t, c]) => [t, { created: c!.created.length, deleted: c!.deleted.length }]),
    ),
  );
  if (Object.keys(changes).length === 0) {
    await setCheckpoint(LAST_PUSHED_AT_KEY, syncStartedAt);
    await prunePullEcho(syncStartedAt);
    return;
  }

  const result = await withRetry('sync_push', () =>
    syncFetchJson('/v1/sync/push', { method: 'POST', body: JSON.stringify({ changes }) }),
  );
  // eslint-disable-next-line no-console
  console.log('[sync] push result:', result === null ? 'FAILED (see above/Sentry)' : result);
  // Échec après épuisement des tentatives : le checkpoint n'avance PAS,
  // ces changements seront repoussés au prochain cycle (LLD point 4,
  // "rejouer le batch non accusé à l'identique" — sûr grâce à l'idempotence
  // par `local_id`, ROADMAP 3.3).
  if (result === null) return;

  await setCheckpoint(LAST_PUSHED_AT_KEY, syncStartedAt);
  // Une entrée d'anti-écho couverte par le checkpoint ne peut plus être
  // sélectionnée par `fetchChangedRows` : c'est ici, et seulement ici, que
  // la table se purge — ce qui borne sa taille.
  await prunePullEcho(syncStartedAt);
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
  // Lignes réellement écrites par ce pull, pour l'anti-écho push
  // (`tables.ts`) : on mémorise l'`updated_at` SERVEUR qu'on vient de leur
  // écrire, afin de ne pas le repousser tel quel au cycle suivant.
  const appliedForEcho: { localId: string; updatedAtMs: number }[] = [];

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
      appliedForEcho.push({ localId: row.local_id, updatedAtMs: raw.updated_at as number });
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
    appliedForEcho.push({ localId: row.local_id, updatedAtMs: raw.updated_at as number });
  }

  if (operations.length > 0) {
    await database.write(async () => {
      await database.batch(...operations);
    });
    // Après l'écriture seulement : mémoriser un écho pour une ligne qui
    // n'aurait pas été committée créerait un trou de push.
    await rememberPulledRows(table, appliedForEcho);
  }
}

export async function pullOnce(): Promise<void> {
  const lastPulledAt = await getCheckpoint(LAST_PULLED_AT_KEY);
  const since = new Date(lastPulledAt).toISOString();
  const tablesParam = SYNC_TABLES.join(',');

  let cursor: string | null = null;
  let latestServerTimestamp: string | null = null;
  // Alimente la cadence adaptative : un pull qui n'applique rien fait
  // descendre l'échelle, un pull qui applique quelque chose la remonte.
  let appliedAnyRow = false;

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
        appliedAnyRow = true;
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

  notifyFastSyncOutcome(appliedAnyRow);
}

// --- cycle complet + déclencheurs --------------------------------------------

// --- pull bloquant avant création d'une séance ------------------------------
// Best-effort, borné — ROADMAP 3.6 révision 2026-08-02 : sans ça, deux
// appareils connectés au même compte à quelques minutes d'écart créaient
// chacun leur propre séance locale, invisible l'un pour l'autre jusqu'au
// prochain cycle de sync (jusqu'à 3 min, PERIODIC_SYNC_INTERVAL_MS
// ci-dessous). `reconcileOpenWorkouts` (db/use-active-workout.ts) reste le
// filet de sécurité pour le cas où les deux appareils étaient hors ligne au
// même moment — inévitable en offline-first, jamais éliminé par ce pull.
//
// Une seule tentative, sans backoff : c'est un aller-retour synchrone dans
// le flux utilisateur (ajout du 1er exercice), pas un cycle de fond. Un
// échec ou un dépassement du délai ne bloque JAMAIS la création locale —
// le mode 100% offline (IMPLEMENTATION_PLAN.md, Bloc B) l'interdit.
const PULL_BEFORE_CREATE_TIMEOUT_MS = 4000;

export async function pullBeforeCreatingWorkout(): Promise<void> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;
  if (syncing) return; // un cycle est déjà en cours, il fera le même travail

  try {
    await Promise.race([
      pullOnce(),
      new Promise<void>((resolve) => setTimeout(resolve, PULL_BEFORE_CREATE_TIMEOUT_MS)),
    ]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[sync] pullBeforeCreatingWorkout best-effort échoué:', error);
  }
}

let syncing = false;
let lastAttemptAt = 0;
// Un flap réseau (WiFi qui renégocie en sortant du mode avion, observé sur
// appareil : 4 événements `isConnected=true` en quelques secondes) ne doit
// pas relancer un cycle complet à chaque événement — le garde `syncing`
// seul ne suffit pas, il ne protège que PENDANT un cycle, pas ENTRE deux.
const MIN_INTERVAL_BETWEEN_ATTEMPTS_MS = 3000;

// Une demande arrivée pendant un cycle : rejouée depuis le `finally`.
let rerunAfterCurrent = false;
// Minuterie de report, UNIQUE — jamais deux en parallèle (même discipline
// singleton que les listeners, CONVENTIONS §5.8). `pendingDueAt` permet de
// n'écraser une minuterie déjà armée que pour une échéance PLUS PROCHE :
// sans ça, un flot de demandes repoussées repousserait indéfiniment
// l'exécution, exactement le bug qu'on veut éviter.
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pendingDueAt = Number.POSITIVE_INFINITY;

function scheduleSync(delayMs: number): void {
  const dueAt = Date.now() + delayMs;
  if (pendingTimer !== null && pendingDueAt <= dueAt) return;
  if (pendingTimer !== null) clearTimeout(pendingTimer);
  pendingDueAt = dueAt;
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    pendingDueAt = Number.POSITIVE_INFINITY;
    void syncNow();
  }, delayMs);
}

// --- demande de sync après écriture locale -----------------------------------
// Sans ça, une écriture locale n'atteignait le serveur qu'au prochain
// déclencheur naturel (jusqu'à 3 min), et l'autre appareil jusqu'à 3 min
// plus tard encore.
//
// `pushOnce` reste volontairement NON exporté : on ne veut jamais d'un push
// sans le pull qui le suit. `requestSync` passe donc par le cycle complet,
// comme tous les autres déclencheurs.
export type SyncReason = 'structural' | 'value' | 'trigger';

const DEBOUNCE_BY_REASON: Record<SyncReason, { debounceMs: number; maxWaitMs: number }> = {
  // Geste isolé et rare (ajout/suppression d'exercice, de série, fin de
  // séance) : 400 ms suffisent à coaguler une multi-sélection sans que la
  // latence soit perceptible.
  structural: { debounceMs: 400, maxWaitMs: 2000 },
  // Le stepper de poids/reps : l'utilisateur martèle à ~200 ms. Sans
  // `maxWaitMs`, chaque tap repousserait l'échéance et on ne pousserait
  // JAMAIS tant qu'il tape. Avec : au pire un push toutes les 10 s.
  value: { debounceMs: 2000, maxWaitMs: 10000 },
  // Déclencheur externe déjà débouncé à la source (cadence rapide).
  trigger: { debounceMs: 0, maxWaitMs: 0 },
};

const debounceTimers: Partial<Record<SyncReason, ReturnType<typeof setTimeout>>> = {};
const debounceFirstRequestAt: Partial<Record<SyncReason, number>> = {};

// Synchrone et fire-and-forget : arme une minuterie et rend la main
// immédiatement. Une écriture locale ne doit JAMAIS attendre le réseau
// (contrainte offline-first, critère de succès n°1).
export function requestSync(reason: SyncReason = 'structural'): void {
  const { debounceMs, maxWaitMs } = DEBOUNCE_BY_REASON[reason];
  const now = Date.now();
  if (debounceFirstRequestAt[reason] === undefined) debounceFirstRequestAt[reason] = now;

  const elapsedSinceFirst = now - debounceFirstRequestAt[reason]!;
  const delayMs = Math.max(0, Math.min(debounceMs, maxWaitMs - elapsedSinceFirst));

  // Une écriture locale signifie que quelque chose bouge : on remet la
  // cadence rapide à son palier le plus court, pour que la réponse de
  // l'autre appareil arrive vite.
  resetFastSyncLadder();

  const existing = debounceTimers[reason];
  if (existing !== undefined) clearTimeout(existing);
  debounceTimers[reason] = setTimeout(() => {
    delete debounceTimers[reason];
    delete debounceFirstRequestAt[reason];
    scheduleSync(0);
  }, delayMs);
}

// Push d'abord (les changements locaux partent avant qu'on n'incorpore des
// données distantes), puis pull. Les deux étapes gèrent leur propre retry
// et abandonnent indépendamment — un push qui échoue après ses tentatives
// n'empêche pas un pull de profiter quand même du réseau redevenu
// disponible.
export async function syncNow(): Promise<void> {
  if (syncing) {
    // ⚠️ REPORTÉ, jamais abandonné. Avant le 2026-08-01, ce chemin faisait
    // un `return` sec : un déclencheur survenant pendant un cycle était
    // purement perdu jusqu'au tick suivant (jusqu'à 3 min). Bénin tant que
    // les déclencheurs étaient rares ; inacceptable depuis que chaque
    // écriture locale en émet un (`requestSync`), où ça reviendrait à
    // perdre silencieusement la propagation d'un exercice.
    rerunAfterCurrent = true;
    // eslint-disable-next-line no-console
    console.log('[sync] syncNow() reporté : un cycle est déjà en cours');
    return;
  }
  const sinceLastAttempt = Date.now() - lastAttemptAt;
  if (sinceLastAttempt < 0) {
    // Horloge revenue en arrière (resynchronisation NTP, réglage manuel —
    // fréquent sur le parc cible, cf. S14 SECURITY_NOTES). Sans ce garde,
    // l'écart négatif est reporté tel quel dans le calcul du délai et la
    // sync serait armée pour dans plusieurs heures : le moteur s'arrêterait
    // silencieusement jusqu'à ce que le temps « rattrape ». Trouvé par le
    // test d'ordonnancement, pas en production.
    lastAttemptAt = 0;
  } else if (sinceLastAttempt < MIN_INTERVAL_BETWEEN_ATTEMPTS_MS) {
    // Idem : on ne jette pas la demande, on l'arme pour la fin du cooldown.
    scheduleSync(MIN_INTERVAL_BETWEEN_ATTEMPTS_MS - sinceLastAttempt);
    // eslint-disable-next-line no-console
    console.log('[sync] syncNow() reporté : trop proche de la tentative précédente');
    return;
  }
  lastAttemptAt = Date.now();

  // ⚠️ Vérifié AVANT toute tentative, pas découvert via l'échec d'un
  // premier `fetch()` : sans ça, chaque déclenchement en mode avion lançait
  // jusqu'à 10 tentatives réseau (5 pour push, 5 pour pull) qui échouent
  // chacune sur un timeout DNS — près d'une minute d'activité réseau en
  // tâche de fond à chaque événement AppState/NetInfo, assez pour rendre
  // l'écran du repos (qui se redessine toutes les 250 ms) perceptiblement
  // lent aux taps. Bug constaté sur appareil le 2026-08-01.
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    // eslint-disable-next-line no-console
    console.log('[sync] syncNow() ignoré : pas de connexion réseau');
    return;
  }

  syncing = true;
  // eslint-disable-next-line no-console
  console.log('[sync] syncNow() démarré');
  try {
    await pushOnce();
    await pullOnce();
    // eslint-disable-next-line no-console
    console.log('[sync] syncNow() terminé');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[sync] syncNow() a levé une erreur inattendue:', error);
    throw error;
  } finally {
    syncing = false;
    if (rerunAfterCurrent) {
      rerunAfterCurrent = false;
      // Rejeu de la demande arrivée pendant ce cycle. `scheduleSync(0)` et
      // non un appel direct : si le cycle a duré moins que le cooldown,
      // `syncNow()` le reportera lui-même proprement au lieu de le perdre.
      scheduleSync(0);
    }
  }
}

let started = false;
let removeAppStateListener: (() => void) | null = null;
let removeNetInfoListener: (() => void) | null = null;
let periodicSyncInterval: ReturnType<typeof setInterval> | null = null;

// Un cycle complet toutes les 3 minutes tant que l'app est au premier plan
// (le timer JS ne tourne de toute façon pas en arrière-plan sur RN — les
// déclencheurs AppState/NetInfo prennent le relais dès le retour). Réduit
// la fenêtre "appareil désactivé mais pas encore au courant" (ROADMAP 3.6)
// pour une session longue restée ouverte sans jamais déclencher les
// triggers événementiels — ne l'élimine pas : la contrainte "100%
// offline" (IMPLEMENTATION_PLAN.md, Bloc B) interdit d'exiger une
// vérification réseau avant d'autoriser à loguer une série. Bug constaté
// sur appareil le 2026-08-01 : sans ça, deux appareils du même compte
// pouvaient diverger (séances locales différentes) pendant toute la durée
// où l'ancien appareil restait ouvert sans redémarrage complet.
const PERIODIC_SYNC_INTERVAL_MS = 3 * 60 * 1000;

// --- cadence rapide pendant une séance active --------------------------------
// La minuterie de 3 min est le plancher : elle suffit pour détecter un
// appareil désactivé, pas pour qu'un exercice ajouté sur un téléphone
// apparaisse sur l'autre pendant la même séance. On accélère donc, mais
// UNIQUEMENT tant que l'écran de séance active est monté — c'est le seul
// endroit où deux appareils travaillent réellement en parallèle.
//
// L'échelle dégrade automatiquement en l'absence de nouveauté. C'est ELLE,
// et non la cadence nominale, qui borne la consommation : sur un parc à
// forfait mesuré, un pull toutes les 5 s pendant une heure serait
// indéfendable, alors que la même cadence qui retombe à 30 s après quelques
// pulls vides ne coûte presque rien.
const FAST_SYNC_LADDER_MS = [5000, 10000, 20000, 30000];
const EMPTY_PULLS_BEFORE_SLOWDOWN = 3;
// Réseau coûteux / 2G-3G : on ne descend jamais sous ce palier, quelle que
// soit l'activité. Contrainte explicite du parc cible.
const FAST_SYNC_METERED_FLOOR_MS = 20000;

let fastSyncRefCount = 0;
let fastSyncInterval: ReturnType<typeof setInterval> | null = null;
let fastSyncRungIndex = 0;
let consecutiveEmptyPulls = 0;
let fastSyncFloorMs = 0;
let appIsForeground = true;

function currentFastSyncIntervalMs(): number {
  return Math.max(FAST_SYNC_LADDER_MS[fastSyncRungIndex]!, fastSyncFloorMs);
}

function applyFastSyncInterval(): void {
  if (fastSyncInterval !== null) {
    clearInterval(fastSyncInterval);
    fastSyncInterval = null;
  }
  // Arrêtée, pas seulement ignorée, hors premier plan ou sans consommateur :
  // une minuterie qui tourne pour rien réveille la radio sur bas de gamme.
  if (fastSyncRefCount === 0 || !appIsForeground) return;

  const intervalMs = currentFastSyncIntervalMs();
  fastSyncInterval = setInterval(() => void syncNow(), intervalMs);
  // eslint-disable-next-line no-console
  console.log('[sync] cadence rapide:', intervalMs, 'ms');
}

function notifyFastSyncOutcome(appliedAnyRow: boolean): void {
  if (fastSyncRefCount === 0) return;

  if (appliedAnyRow) {
    consecutiveEmptyPulls = 0;
    if (fastSyncRungIndex !== 0) {
      fastSyncRungIndex = 0;
      applyFastSyncInterval();
    }
    return;
  }

  consecutiveEmptyPulls += 1;
  if (consecutiveEmptyPulls < EMPTY_PULLS_BEFORE_SLOWDOWN) return;
  consecutiveEmptyPulls = 0;
  if (fastSyncRungIndex < FAST_SYNC_LADDER_MS.length - 1) {
    fastSyncRungIndex += 1;
    applyFastSyncInterval();
  }
}

function resetFastSyncLadder(): void {
  if (fastSyncRefCount === 0) return;
  consecutiveEmptyPulls = 0;
  if (fastSyncRungIndex !== 0) {
    fastSyncRungIndex = 0;
    applyFastSyncInterval();
  }
}

// Compteur de références, PAS un booléen : deux écrans montés (ou un
// remontage React pendant une transition) ne doivent ni empiler des
// minuteries, ni couper la cadence au premier démontage.
// Usage : `useEffect(() => acquireFastSync(), [])`.
export function acquireFastSync(): () => void {
  fastSyncRefCount += 1;
  if (fastSyncRefCount === 1) {
    fastSyncRungIndex = 0;
    consecutiveEmptyPulls = 0;
    applyFastSyncInterval();
  }

  let released = false;
  return () => {
    if (released) return; // libérer deux fois ne doit pas décrémenter deux fois
    released = true;
    fastSyncRefCount = Math.max(0, fastSyncRefCount - 1);
    if (fastSyncRefCount === 0) applyFastSyncInterval();
  };
}

// Déclencheurs "naturels" (LLD §3.2/CONVENTIONS §5.8) : retour au premier
// plan et retour réseau. Singleton — appeler deux fois est un no-op, pas un
// double enregistrement de listener.
export function startAutoSync(): void {
  if (started) return;
  started = true;

  const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
    // eslint-disable-next-line no-console
    console.log('[sync] AppState change:', state);
    appIsForeground = state === 'active';
    applyFastSyncInterval();
    if (state === 'active') void syncNow();
  });
  removeAppStateListener = () => appStateSub.remove();

  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    // eslint-disable-next-line no-console
    console.log('[sync] NetInfo change: isConnected=', state.isConnected, 'type=', state.type);
    // Plancher de cadence sur réseau coûteux ou 2G/3G — réévalué à chaque
    // changement, pas figé au démarrage : on passe du WiFi au mobile en
    // sortant de chez soi, précisément en allant à la salle.
    const details = state.details as { isConnectionExpensive?: boolean; cellularGeneration?: string } | null;
    const slowCellular =
      state.type === 'cellular' &&
      (details?.cellularGeneration === '2g' || details?.cellularGeneration === '3g');
    const nextFloor = details?.isConnectionExpensive || slowCellular ? FAST_SYNC_METERED_FLOOR_MS : 0;
    if (nextFloor !== fastSyncFloorMs) {
      fastSyncFloorMs = nextFloor;
      applyFastSyncInterval();
    }
    if (state.isConnected) void syncNow();
  });
  removeNetInfoListener = unsubscribeNetInfo;

  periodicSyncInterval = setInterval(() => void syncNow(), PERIODIC_SYNC_INTERVAL_MS);

  // ⚠️ Appelé IMMÉDIATEMENT, pas seulement au premier événement AppState/
  // NetInfo : un démarrage à froid ne déclenche pas forcément de
  // transition 'active' (l'app EST déjà 'active' au montage, il n'y a pas
  // de changement d'état à observer) — sans cet appel explicite, ouvrir
  // l'app pouvait ne rien vérifier du tout tant qu'aucun trigger
  // événementiel ne survenait par ailleurs. C'est cet appel qui détecte le
  // plus tôt possible qu'un autre appareil a pris la place.
  void syncNow();

  // eslint-disable-next-line no-console
  console.log('[sync] startAutoSync() : listeners AppState/NetInfo enregistrés + sync immédiat');
}

export function stopAutoSync(): void {
  removeAppStateListener?.();
  removeNetInfoListener?.();
  if (periodicSyncInterval) clearInterval(periodicSyncInterval);
  if (fastSyncInterval !== null) clearInterval(fastSyncInterval);
  if (pendingTimer !== null) clearTimeout(pendingTimer);
  for (const reason of Object.keys(debounceTimers) as SyncReason[]) {
    clearTimeout(debounceTimers[reason]!);
    delete debounceTimers[reason];
    delete debounceFirstRequestAt[reason];
  }
  removeAppStateListener = null;
  removeNetInfoListener = null;
  periodicSyncInterval = null;
  fastSyncInterval = null;
  fastSyncRefCount = 0;
  fastSyncRungIndex = 0;
  consecutiveEmptyPulls = 0;
  pendingTimer = null;
  pendingDueAt = Number.POSITIVE_INFINITY;
  rerunAfterCurrent = false;
  started = false;
}
