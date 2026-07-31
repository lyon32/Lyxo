import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../lib/async-handler';
import { AppError } from '../lib/errors';
import { isSyncTableName, type SyncTableName } from '../lib/sync-tables';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { requireAuth } from '../middleware/require-auth';

export const syncRouter = Router();

// API_SPEC.md §4.1 / CLAUDE_LYXO_V3.md §18.4 : 500 lignes MAX par table par
// réponse — un user qui revient après 6 mois ne doit pas déclencher un pull
// de milliers de lignes en une requête sur Render.
const MAX_PAGE_SIZE = 500;

interface TableCursor {
  updatedAt: string;
  id: string;
}

type Cursor = Partial<Record<SyncTableName, TableCursor>>;

// Curseur = keyset (updated_at, id) PAR TABLE, pas un simple offset : un
// offset se désynchronise si des lignes sont insérées pendant la
// pagination (une séance loggée par un AUTRE appareil du même profil entre
// deux pages, par exemple) — un keyset ne saute ni ne double jamais de
// ligne, il ne fait qu'avancer depuis la dernière ligne réellement vue.
function decodeCursor(raw: unknown): Cursor {
  if (typeof raw !== 'string' || raw.length === 0) return {};
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (parsed && typeof parsed === 'object') return parsed as Cursor;
    throw new Error('not an object');
  } catch {
    throw new AppError('VALIDATION_ERROR', 'Invalid cursor.', { fields: ['cursor'] });
  }
}

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

// Filtre de PROPRIÉTÉ appliqué en code, pas en RLS : le backend interroge
// avec la clé service_role (bypass RLS, lib/supabase-admin.ts) — sans ce
// filtre explicite par table, n'importe quel profil authentifié pourrait
// tirer les séances de n'importe quel autre (API_SPEC §1 : RLS = defense-
// in-depth, jamais le mécanisme primaire côté API).
//
// `workout_exercises`/`sets` n'ont pas de `profile_id` propre : la
// propriété remonte par `workout_id`/`workout_exercise_id`. Deux requêtes
// d'ids séparées plutôt qu'un embed PostgREST multi-niveaux
// (`sets.workout_exercises.workouts.profile_id`) — même choix que
// `db/pr-recording.ts`/`db/use-workout-summary.ts` côté client : une
// requête simple par palier plutôt qu'un helper de jointure profonde.
async function loadOwnershipScope(
  userId: string,
  requestedTables: readonly SyncTableName[],
): Promise<{ workoutIds: string[]; workoutExerciseIds: string[] } | AppError> {
  const admin = getSupabaseAdmin();

  const needsWorkoutIds =
    requestedTables.includes('workouts') ||
    requestedTables.includes('workout_exercises') ||
    requestedTables.includes('sets');
  let workoutIds: string[] = [];
  if (needsWorkoutIds) {
    const { data, error } = await admin.from('workouts').select('id').eq('profile_id', userId);
    if (error) return new AppError('INTERNAL_ERROR', error.message);
    workoutIds = (data ?? []).map((row) => row.id);
  }

  let workoutExerciseIds: string[] = [];
  if (requestedTables.includes('sets') && workoutIds.length > 0) {
    const { data, error } = await admin
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);
    if (error) return new AppError('INTERNAL_ERROR', error.message);
    workoutExerciseIds = (data ?? []).map((row) => row.id);
  }

  return { workoutIds, workoutExerciseIds };
}

// GET /v1/sync/pull — API_SPEC.md §4.1, ROADMAP 3.2.
syncRouter.get(
  '/v1/sync/pull',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const userId = req.auth!.userId;

    const rawTables = String(req.query.tables ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (rawTables.length === 0) {
      next(new AppError('VALIDATION_ERROR', 'tables query param is required.', { fields: ['tables'] }));
      return;
    }
    const unknownTables = rawTables.filter((t) => !isSyncTableName(t));
    if (unknownTables.length > 0) {
      next(new AppError('VALIDATION_ERROR', 'Unknown table(s) requested.', { tables: unknownTables }));
      return;
    }
    const requestedTables = rawTables as SyncTableName[];

    const sinceRaw = typeof req.query.since === 'string' ? req.query.since : '1970-01-01T00:00:00.000Z';
    if (Number.isNaN(Date.parse(sinceRaw))) {
      next(new AppError('VALIDATION_ERROR', 'Invalid since timestamp.', { fields: ['since'] }));
      return;
    }

    let cursor: Cursor;
    try {
      cursor = decodeCursor(req.query.cursor);
    } catch (error) {
      next(error);
      return;
    }

    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;

    const scope = await loadOwnershipScope(userId, requestedTables);
    if (scope instanceof AppError) {
      next(scope);
      return;
    }
    const { workoutIds, workoutExerciseIds } = scope;

    const admin = getSupabaseAdmin();
    const data: Partial<Record<SyncTableName, unknown[]>> = {};
    const nextCursor: Cursor = {};
    let hasMore = false;

    for (const table of requestedTables) {
      // Propriétaire sans aucune ligne : `workouts`/`workout_exercises`
      // vides pour ce profil → rien à interroger sur les tables qui EN
      // dépendent, pas la peine d'un aller-retour DB pour une réponse vide
      // connue d'avance.
      if (table === 'workout_exercises' && workoutIds.length === 0) {
        data[table] = [];
        nextCursor[table] = undefined;
        continue;
      }
      if (table === 'sets' && workoutExerciseIds.length === 0) {
        data[table] = [];
        nextCursor[table] = undefined;
        continue;
      }

      // `!` sûr : la seule variable dynamique dans .from() ici vient de
      // SYNC_TABLES, un tuple de littéraux fermé — voir lib/sync-tables.ts.
      // Le type généré Supabase n'expose pas d'overload générique sur un
      // nom de table dynamique, d'où cette assertion ciblée plutôt qu'un
      // `any` global (même compromis que lib/supabase-admin.ts, `ws as any`).
      let query = admin
        .from(table as never)
        .select('*')
        .order('updated_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(limit);

      if (table === 'workouts') {
        query = query.eq('profile_id', userId);
      } else if (table === 'workout_exercises') {
        query = query.in('workout_id', workoutIds);
      } else if (table === 'sets') {
        query = query.in('workout_exercise_id', workoutExerciseIds);
      } else if (table === 'personal_records') {
        query = query.eq('profile_id', userId);
      }
      // `exercises` : référentiel public en lecture seule (API_SPEC §4.1),
      // aucun filtre de propriété — c'est voulu, pas un oubli.

      const tableCursor = cursor[table];
      if (tableCursor) {
        query = query.or(
          `updated_at.gt.${tableCursor.updatedAt},and(updated_at.eq.${tableCursor.updatedAt},id.gt.${tableCursor.id})`,
        );
      } else {
        query = query.gte('updated_at', sinceRaw);
      }

      const { data: rows, error } = await query;
      if (error) {
        next(new AppError('INTERNAL_ERROR', error.message));
        return;
      }

      const typedRows = (rows ?? []) as Array<{ updated_at: string; id: string }>;
      data[table] = typedRows;

      if (typedRows.length === limit) {
        hasMore = true;
        const last = typedRows[typedRows.length - 1];
        nextCursor[table] = { updatedAt: last.updated_at, id: last.id };
      } else {
        nextCursor[table] = tableCursor;
      }
    }

    res.status(200).json({
      data,
      next_cursor: hasMore ? encodeCursor(nextCursor) : null,
      has_more: hasMore,
      server_timestamp: new Date().toISOString(),
      // `subscriptions` n'existe pas avant la Phase 9 (§20.1) : toujours
      // false/null jusque-là, jamais lu depuis une colonne (API_SPEC §4.1).
      is_premium: false,
      premium_until: null,
    });
  }),
);

// POST /v1/sync/push — API_SPEC.md §4.1, ROADMAP 3.3.
//
// ⚠️ Contrat d'idempotence, LLD.md ("AJOUT audit technique 2026-07-25") :
// la clé est le `local_id` de CHAQUE entité — jamais un id serveur, jamais
// une position dans le batch (deux séries identiques à 80kg×8 dans la même
// séance sont NORMALES en musculation, pas un cas limite : les distinguer
// par contenu fusionnerait ou dupliquerait au rejeu). `local_id` = l'`id`
// WatermelonDB du record lui-même (jamais réattribué), voir `db/schema.ts`.
//
// ⚠️ Traduction de références LOCALES : les champs `workout_id`
// (workout_exercises), `workout_exercise_id` (sets) et `set_id`
// (personal_records) envoyés par le client sont les `local_id` du PARENT,
// pas des uuid serveur — le client ne connaît pas forcément l'id serveur
// d'un parent créé dans la MÊME séance offline. Résolus ici via
// `resolveServerId`, avec un cache par requête qui absorbe les parents
// tout juste créés dans CE MÊME push (permet de pousser une séance
// complète neuve — workout + exercices + séries — en un seul appel).
//
// ⚠️ Simplification assumée et documentée (pas la version idéale de LLD
// point 2, "tout le batch dans une seule transaction") : chaque table est
// upsertée séquentiellement, pas dans une transaction Postgres unique —
// écrire un tel mécanisme demanderait une fonction RPC dédiée, hors
// périmètre de cette tâche. Ça reste SÛR sous rejeu : chaque écriture est
// individuellement idempotente via son propre index unique `local_id`
// scopé au parent, donc rejouer un batch partiellement appliqué ne
// duplique jamais rien — seul le "tout ou rien" strict de LLD point 2
// n'est pas garanti (un crash mi-push peut laisser un workout_exercise
// sans ses sets jusqu'au rejeu suivant, jamais un doublon). À revisiter en
// RPC si les torture tests de 3.7 révèlent un problème réel.
//
// ⚠️ Propriété vérifiée EN CODE via des listes d'ids précalculées
// (`ownedWorkoutIds`/`ownedWorkoutExerciseIds`), pas par embed PostgREST
// multi-niveaux ni par RLS (service_role bypass) — même choix que le pull
// ci-dessus et que `db/pr-recording.ts` côté client.

type IdCache = Map<string, string>;

// Échappatoire de typage CIBLÉE (même compromis que `ws as any` dans
// `lib/supabase-admin.ts`) : `local_id` sur workout_exercises/sets et la
// table `personal_records` entière n'existent pas encore dans les types
// générés (`backend/src/types/supabase.ts`) — leurs migrations ne sont pas
// appliquées (2026-07-31, ce fichier même le documente en 3.2/3.3).
// Regénérer les types résoudra ceci une fois les migrations appliquées ;
// `db/schema.test.ts` (côté app) est le garde-fou qui rappellera de le
// faire avant que la dérive ne devienne invisible.
function rawTable(admin: ReturnType<typeof getSupabaseAdmin>, name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (admin as any).from(name);
}

async function resolveServerId(
  admin: ReturnType<typeof getSupabaseAdmin>,
  table: SyncTableName,
  filterColumn: string,
  filterValues: readonly string[],
  cache: IdCache,
  localId: string,
): Promise<string | null> {
  const cached = cache.get(localId);
  if (cached) return cached;
  if (filterValues.length === 0) return null;

  const { data, error } = await rawTable(admin, table)
    .select('id')
    .eq('local_id', localId)
    .in(filterColumn, filterValues as string[])
    .maybeSingle();
  if (error) throw new AppError('INTERNAL_ERROR', (error as { message: string }).message);
  if (!data) return null;

  const id = (data as { id: string }).id;
  cache.set(localId, id);
  return id;
}

// Un schéma explicite par table plutôt qu'un helper générique : un helper
// générique `changeSetSchema<T>(fields: T)` a été essayé, mais l'inférence
// Zod s'effondre à l'intérieur d'une fonction générique (`.extend()`/
// `.partial()` sur un `T extends z.ZodObject<...>` perdent leurs types
// concrets, `completed_at` etc. deviennent `{}`) — un piège TS+Zod connu,
// pas une erreur de frappe. Un peu de répétition assumée plutôt qu'une
// abstraction qui casse le typage qu'elle est censée garantir.
//
// Toujours le `local_id` de la ligne elle-même pour `deleted` — jamais un
// id serveur (le client peut supprimer une entité avant même d'avoir
// appris son id serveur, ex. offline complet depuis la création).
const workoutsChangeSchema = z
  .object({
    created: z
      .array(
        z.object({
          local_id: z.string().min(1),
          title: z.string().nullable().optional(),
          program_id: z.string().uuid().nullable().optional(),
          started_at: z.string(),
          completed_at: z.string().nullable().optional(),
          total_volume_kg: z.number().nullable().optional(),
          is_private: z.boolean(),
        }),
      )
      .default([]),
    updated: z
      .array(
        z.object({
          local_id: z.string().min(1),
          title: z.string().nullable().optional(),
          program_id: z.string().uuid().nullable().optional(),
          started_at: z.string().optional(),
          completed_at: z.string().nullable().optional(),
          total_volume_kg: z.number().nullable().optional(),
          is_private: z.boolean().optional(),
        }),
      )
      .default([]),
    deleted: z.array(z.string().min(1)).default([]),
  })
  .optional();

const workoutExercisesChangeSchema = z
  .object({
    created: z
      .array(
        z.object({
          local_id: z.string().min(1),
          workout_id: z.string().min(1), // local_id du parent
          exercise_id: z.string().uuid().nullable().optional(),
          custom_exercise_id: z.string().uuid().nullable().optional(),
          order_index: z.number().int(),
        }),
      )
      .default([]),
    updated: z
      .array(
        z.object({
          local_id: z.string().min(1),
          workout_id: z.string().min(1),
          exercise_id: z.string().uuid().nullable().optional(),
          custom_exercise_id: z.string().uuid().nullable().optional(),
          order_index: z.number().int().optional(),
        }),
      )
      .default([]),
    deleted: z.array(z.string().min(1)).default([]),
  })
  .optional();

const setsChangeSchema = z
  .object({
    created: z
      .array(
        z.object({
          local_id: z.string().min(1),
          workout_exercise_id: z.string().min(1), // local_id du parent
          set_number: z.number().int(),
          weight_kg: z.number(),
          reps: z.number().int(),
          rpe: z.number().min(1).max(10).nullable().optional(),
          is_completed: z.boolean(),
        }),
      )
      .default([]),
    updated: z
      .array(
        z.object({
          local_id: z.string().min(1),
          workout_exercise_id: z.string().min(1),
          set_number: z.number().int().optional(),
          weight_kg: z.number().optional(),
          reps: z.number().int().optional(),
          rpe: z.number().min(1).max(10).nullable().optional(),
          is_completed: z.boolean().optional(),
        }),
      )
      .default([]),
    deleted: z.array(z.string().min(1)).default([]),
  })
  .optional();

const personalRecordsChangeSchema = z
  .object({
    created: z
      .array(
        z.object({
          local_id: z.string().min(1),
          exercise_id: z.string().uuid(), // référentiel public, id serveur réel — pas une référence locale
          set_id: z.string().min(1).nullable().optional(), // local_id du parent, si connu
          weight_kg: z.number(),
          reps: z.number().int(),
          estimated_1rm_kg: z.number().nullable().optional(),
          pr_type: z.enum(['weight', 'volume', 'reps', '1rm']),
          is_social_eligible: z.boolean(),
          ineligibility_reason: z
            .enum(['implausible_weight', 'delta_too_high', 'insufficient_history'])
            .nullable()
            .optional(),
          achieved_at: z.string(),
        }),
      )
      .default([]),
    updated: z
      .array(
        z.object({
          local_id: z.string().min(1),
          is_social_eligible: z.boolean().optional(),
          ineligibility_reason: z
            .enum(['implausible_weight', 'delta_too_high', 'insufficient_history'])
            .nullable()
            .optional(),
        }),
      )
      .default([]),
    deleted: z.array(z.string().min(1)).default([]),
  })
  .optional();

const pushBodySchema = z.object({
  changes: z.object({
    workouts: workoutsChangeSchema,
    workout_exercises: workoutExercisesChangeSchema,
    sets: setsChangeSchema,
    personal_records: personalRecordsChangeSchema,
  }),
});

syncRouter.post(
  '/v1/sync/push',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const userId = req.auth!.userId;
    const parsed = pushBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError('VALIDATION_ERROR', 'Invalid push payload.', parsed.error.issues));
      return;
    }
    const { changes } = parsed.data;
    const admin = getSupabaseAdmin();
    const accepted: Partial<Record<SyncTableName, number>> = {};
    const skipped: Partial<Record<SyncTableName, number>> = {};

    // Portée de propriété, étendue au fil du push par les créations de
    // cette MÊME requête (une séance neuve complète doit se résoudre sans
    // aller-retour supplémentaire).
    const { data: existingWorkouts, error: existingWorkoutsError } = await admin
      .from('workouts')
      .select('id')
      .eq('profile_id', userId);
    if (existingWorkoutsError) {
      next(new AppError('INTERNAL_ERROR', existingWorkoutsError.message));
      return;
    }
    const ownedWorkoutIds: string[] = (existingWorkouts ?? []).map((w) => w.id);

    let ownedWorkoutExerciseIds: string[] = [];
    if (ownedWorkoutIds.length > 0) {
      const { data: existingWorkoutExercises, error: existingWeError } = await admin
        .from('workout_exercises')
        .select('id')
        .in('workout_id', ownedWorkoutIds);
      if (existingWeError) {
        next(new AppError('INTERNAL_ERROR', existingWeError.message));
        return;
      }
      ownedWorkoutExerciseIds = (existingWorkoutExercises ?? []).map((we) => we.id);
    }

    const workoutIdCache: IdCache = new Map();
    const workoutExerciseIdCache: IdCache = new Map();
    const setIdCache: IdCache = new Map();

    try {
      // --- workouts --------------------------------------------------------
      if (changes.workouts) {
        const { created, updated, deleted } = changes.workouts;
        let count = 0;

        if (created.length > 0) {
          const rows = created.map((item) => ({
            profile_id: userId, // jamais celui du client (API_SPEC §1)
            local_id: item.local_id,
            title: item.title ?? null,
            program_id: item.program_id ?? null,
            started_at: item.started_at,
            completed_at: item.completed_at ?? null,
            total_volume_kg: item.total_volume_kg ?? null,
            is_private: item.is_private,
          }));
          const { data, error } = await admin
            .from('workouts')
            .upsert(rows, { onConflict: 'profile_id,local_id' })
            .select('id, local_id');
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          for (const row of data ?? []) {
            workoutIdCache.set(row.local_id, row.id);
            if (!ownedWorkoutIds.includes(row.id)) ownedWorkoutIds.push(row.id);
          }
          count += created.length;
        }

        for (const item of updated) {
          const { local_id, ...patch } = item;
          const { error } = await admin
            .from('workouts')
            .update(patch)
            .eq('profile_id', userId)
            .eq('local_id', local_id);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += 1;
        }

        if (deleted.length > 0) {
          const { error } = await admin
            .from('workouts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('profile_id', userId)
            .in('local_id', deleted);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += deleted.length;
        }

        accepted.workouts = count;
      }

      // --- workout_exercises -------------------------------------------------
      if (changes.workout_exercises) {
        const { created, updated, deleted } = changes.workout_exercises;
        let count = 0;
        let skippedCount = 0;

        if (created.length > 0) {
          const rows: Array<Record<string, unknown>> = [];
          for (const item of created) {
            const workoutId = await resolveServerId(
              admin,
              'workouts',
              'profile_id',
              [userId],
              workoutIdCache,
              item.workout_id,
            );
            // Parent introuvable (pas dans ce push, pas déjà en base) : on
            // saute cet item plutôt que de faire échouer tout le batch —
            // il repassera au prochain push une fois son parent poussé.
            if (!workoutId) {
              skippedCount += 1;
              continue;
            }
            rows.push({
              workout_id: workoutId,
              local_id: item.local_id,
              exercise_id: item.exercise_id ?? null,
              custom_exercise_id: item.custom_exercise_id ?? null,
              order_index: item.order_index,
            });
          }
          if (rows.length > 0) {
            const { data, error } = await rawTable(admin, 'workout_exercises')
              .upsert(rows, { onConflict: 'workout_id,local_id' })
              .select('id, local_id');
            if (error) throw new AppError('INTERNAL_ERROR', error.message);
            for (const row of data ?? []) {
              workoutExerciseIdCache.set(row.local_id, row.id);
              if (!ownedWorkoutExerciseIds.includes(row.id)) ownedWorkoutExerciseIds.push(row.id);
            }
            count += rows.length;
          }
        }

        for (const item of updated) {
          // Construit explicitement plutôt que par rest-destructuring : `local_id`
          // et `workout_id` servent à LOCALISER la ligne, jamais à la modifier.
          const patch: Record<string, unknown> = {};
          if (item.exercise_id !== undefined) patch.exercise_id = item.exercise_id;
          if (item.custom_exercise_id !== undefined) patch.custom_exercise_id = item.custom_exercise_id;
          if (item.order_index !== undefined) patch.order_index = item.order_index;

          const { error } = await rawTable(admin, 'workout_exercises')
            .update(patch)
            .eq('local_id', item.local_id)
            .in('workout_id', ownedWorkoutIds.length > 0 ? ownedWorkoutIds : ['00000000-0000-0000-0000-000000000000']);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += 1;
        }

        if (deleted.length > 0 && ownedWorkoutIds.length > 0) {
          const { error } = await rawTable(admin, 'workout_exercises')
            .update({ deleted_at: new Date().toISOString() })
            .in('workout_id', ownedWorkoutIds)
            .in('local_id', deleted);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += deleted.length;
        }

        accepted.workout_exercises = count;
        if (skippedCount > 0) skipped.workout_exercises = skippedCount;
      }

      // --- sets --------------------------------------------------------------
      if (changes.sets) {
        const { created, updated, deleted } = changes.sets;
        let count = 0;
        let skippedCount = 0;

        if (created.length > 0) {
          const rows: Array<Record<string, unknown>> = [];
          for (const item of created) {
            const workoutExerciseId = await resolveServerId(
              admin,
              'workout_exercises',
              'workout_id',
              ownedWorkoutIds,
              workoutExerciseIdCache,
              item.workout_exercise_id,
            );
            if (!workoutExerciseId) {
              skippedCount += 1;
              continue;
            }
            rows.push({
              workout_exercise_id: workoutExerciseId,
              local_id: item.local_id,
              set_number: item.set_number,
              weight_kg: item.weight_kg,
              reps: item.reps,
              rpe: item.rpe ?? null,
              is_completed: item.is_completed,
            });
          }
          if (rows.length > 0) {
            const { data, error } = await rawTable(admin, 'sets')
              .upsert(rows, { onConflict: 'workout_exercise_id,local_id' })
              .select('id, local_id');
            if (error) throw new AppError('INTERNAL_ERROR', error.message);
            for (const row of data ?? []) setIdCache.set(row.local_id, row.id);
            count += rows.length;
          }
        }

        for (const item of updated) {
          // Idem workout_exercises : `local_id`/`workout_exercise_id` localisent
          // la ligne, ils ne font jamais partie du patch.
          const patch: Record<string, unknown> = {};
          if (item.set_number !== undefined) patch.set_number = item.set_number;
          if (item.weight_kg !== undefined) patch.weight_kg = item.weight_kg;
          if (item.reps !== undefined) patch.reps = item.reps;
          if (item.rpe !== undefined) patch.rpe = item.rpe;
          if (item.is_completed !== undefined) patch.is_completed = item.is_completed;

          const { error } = await rawTable(admin, 'sets')
            .update(patch)
            .eq('local_id', item.local_id)
            .in(
              'workout_exercise_id',
              ownedWorkoutExerciseIds.length > 0
                ? ownedWorkoutExerciseIds
                : ['00000000-0000-0000-0000-000000000000'],
            );
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += 1;
        }

        if (deleted.length > 0 && ownedWorkoutExerciseIds.length > 0) {
          const { error } = await rawTable(admin, 'sets')
            .update({ deleted_at: new Date().toISOString() })
            .in('workout_exercise_id', ownedWorkoutExerciseIds)
            .in('local_id', deleted);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += deleted.length;
        }

        accepted.sets = count;
        if (skippedCount > 0) skipped.sets = skippedCount;
      }

      // --- personal_records ----------------------------------------------
      if (changes.personal_records) {
        const { created, updated, deleted } = changes.personal_records;
        let count = 0;

        if (created.length > 0) {
          const rows: Array<Record<string, unknown>> = [];
          for (const item of created) {
            // `set_id` est optionnel côté schéma (DATA_MODEL §2.8) : un PR
            // dont le set n'a jamais été résolu reste enregistré sans lien,
            // jamais rejeté pour autant — ce n'est pas une référence
            // obligatoire comme `workout_id`/`workout_exercise_id`.
            const setId = item.set_id
              ? await resolveServerId(
                  admin,
                  'sets',
                  'workout_exercise_id',
                  ownedWorkoutExerciseIds,
                  setIdCache,
                  item.set_id,
                )
              : null;
            rows.push({
              profile_id: userId,
              local_id: item.local_id,
              exercise_id: item.exercise_id,
              set_id: setId,
              weight_kg: item.weight_kg,
              reps: item.reps,
              estimated_1rm_kg: item.estimated_1rm_kg ?? null,
              pr_type: item.pr_type,
              is_social_eligible: item.is_social_eligible,
              ineligibility_reason: item.ineligibility_reason ?? null,
              achieved_at: item.achieved_at,
            });
          }
          const { error } = await rawTable(admin, 'personal_records').upsert(rows, {
            onConflict: 'profile_id,local_id',
          });
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += rows.length;
        }

        for (const item of updated) {
          const { local_id, ...patch } = item;
          const { error } = await rawTable(admin, 'personal_records')
            .update(patch)
            .eq('profile_id', userId)
            .eq('local_id', local_id);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += 1;
        }

        if (deleted.length > 0) {
          const { error } = await rawTable(admin, 'personal_records')
            .update({ deleted_at: new Date().toISOString() })
            .eq('profile_id', userId)
            .in('local_id', deleted);
          if (error) throw new AppError('INTERNAL_ERROR', error.message);
          count += deleted.length;
        }

        accepted.personal_records = count;
      }
    } catch (error) {
      next(error);
      return;
    }

    res.status(200).json({
      accepted,
      // Toujours vide en V1 (LWW silencieux, Q12a) — le tableau existe pour
      // un futur monitoring (API_SPEC §4.1).
      conflicts: [],
      // Extension au format documenté par API_SPEC §4.1 : items dont le
      // parent référencé (local_id) n'a été trouvé ni dans ce push ni en
      // base — pas une erreur bloquante, le client les repoussera une fois
      // le parent connu du serveur.
      ...(Object.keys(skipped).length > 0 ? { skipped } : {}),
    });
  }),
);
