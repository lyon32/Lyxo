import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import * as Sentry from '@sentry/react-native';

import { database } from './index';
import type { Workout } from './models/Workout';
import type { WorkoutExercise } from './models/WorkoutExercise';
import type { WorkoutSet } from './models/WorkoutSet';
import { getCachedProfileId } from '../lib/auth-store';

export interface ActiveSetView {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
}

export interface ActiveExerciseView {
  id: string;
  exerciseId: string | null;
  customExerciseId: string | null;
  sets: ActiveSetView[];
}

export interface ActiveWorkoutView {
  workoutId: string;
  exercises: ActiveExerciseView[];
  totalSets: number;
}

// Lecture DIRECTE en base, jamais depuis `view` — le state React d'un hook
// appelant est capturé dans une closure au moment du rendu et ne reflète pas
// une écriture qu'on vient de faire dans LA MÊME fonction async, même après
// l'avoir attendue : React ne rafraîchit `view` qu'au rendu SUIVANT, avec une
// nouvelle instance de la fonction. Lire `view` juste après un `updateSet`
// pour la même série renvoyait donc l'ancienne valeur (souvent `reps: 0`, le
// défaut d'`addSet`) — bug constaté sur appareil le 2026-07-30 : une série
// à 25 reps validée juste après la saisie se voyait créditée d'un PR
// "Volume 0 kg / Reps 0".
export async function getSetSnapshot(
  setId: string,
): Promise<{ weightKg: number; reps: number } | null> {
  const row = await database.get<WorkoutSet>('sets').find(setId);
  return { weightKg: row.weightKg, reps: row.reps };
}

// ⚠️ Lu depuis un cache LOCAL (SecureStore, écrit par `lib/auth-store.ts` à
// chaque changement de session) — surtout PAS `supabase.auth.getSession()`.
// L'ancien commentaire ici affirmait que `getSession()` "lit le cache local,
// pas d'aller-retour réseau" : FAUX dès que le token d'accès est expiré.
// Dans ce cas supabase-js tente un rafraîchissement RÉSEAU avant de
// répondre, et renvoie une session VIDE si ce refresh échoue — exactement
// ce qui se produit hors ligne. Bug constaté sur appareil le 2026-07-30
// (DoD ROADMAP 2.12) : "Aucune session : impossible de créer la séance" en
// mode avion, alors qu'un utilisateur était bel et bien connecté.
//
// L'identité d'un profil déjà connecté ne change pas hors ligne : il n'y a
// aucune raison de la reconfirmer en réseau pour une écriture purement
// LOCALE (WatermelonDB). Rien ne quitte l'appareil avant la sync (Phase 3),
// où le serveur revalide de toute façon le vrai JWT (API_SPEC §1) — jamais
// confiance dans un `profile_id` envoyé par le client. `getSession()` reste
// le bon choix pour un appel API réellement authentifié, pas pour savoir
// dans quelle ligne locale écrire.
export async function currentProfileId(): Promise<string | null> {
  return getCachedProfileId();
}

// La séance "en cours" est celle qui n'a pas de `completed_at` — c'est ce
// champ, et lui seul, qui distingue ouverte de terminée (DATA_MODEL §2.5).
async function findOpenWorkout(profileId: string): Promise<Workout | null> {
  const rows = await database
    .get<Workout>('workouts')
    .query(
      Q.where('profile_id', profileId),
      Q.where('completed_at', null),
      Q.where('deleted_at', null),
      Q.sortBy('started_at', Q.desc),
      Q.take(1),
    )
    .fetch();
  return rows[0] ?? null;
}

async function loadView(): Promise<ActiveWorkoutView | null> {
  const profileId = await currentProfileId();
  if (!profileId) return null;

  const workout = await findOpenWorkout(profileId);
  if (!workout) return null;

  const workoutExercises = await database
    .get<WorkoutExercise>('workout_exercises')
    .query(
      Q.where('workout_id', workout.id),
      Q.where('deleted_at', null),
      Q.sortBy('order_index', Q.asc),
    )
    .fetch();

  // Une requête par exercice : la boucle est assumée (SQLite local, une
  // séance dépasse rarement une dizaine d'exercices) et évite de dépendre
  // d'un helper de requête supplémentaire.
  const exercises: ActiveExerciseView[] = [];
  for (const workoutExercise of workoutExercises) {
    const sets = await database
      .get<WorkoutSet>('sets')
      .query(
        Q.where('workout_exercise_id', workoutExercise.id),
        Q.where('deleted_at', null),
        Q.sortBy('set_number', Q.asc),
      )
      .fetch();

    exercises.push({
      id: workoutExercise.id,
      exerciseId: workoutExercise.exerciseId,
      customExerciseId: workoutExercise.customExerciseId,
      sets: sets.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        weightKg: set.weightKg,
        reps: set.reps,
        isCompleted: set.isCompleted,
      })),
    });
  }

  return {
    workoutId: workout.id,
    exercises,
    totalSets: exercises.reduce((sum, item) => sum + item.sets.length, 0),
  };
}

// Séance en cours, persistée localement (ROADMAP 2.6).
//
// ⚠️ Écart assumé avec le TABLEAU de LLD.md §4, qui range la séance en cours
// dans un store Zustand éphémère. La RÈGLE écrite juste sous ce tableau dit
// l'inverse et l'emporte : "si une donnée doit survivre à un crash de l'app,
// elle vit dans WatermelonDB, jamais dans un store Zustand". Perdre une
// séance parce qu'Android a tué l'app en arrière-plan — courant sur les
// appareils d'entrée de gamme du marché cible — est inacceptable pour une
// app offline-first.
//
// Le motif du tableau ("éviter d'écrire en base à chaque tap") est respecté
// autrement : le TAMPON de frappe du clavier reste en mémoire, seules les
// valeurs VALIDÉES descendent en base.
export function useActiveWorkout() {
  const [view, setView] = useState<ActiveWorkoutView | null>(null);
  const [ready, setReady] = useState(false);
  // Un tap qui ne produit NI effet NI message est le pire résultat possible :
  // impossible à distinguer d'un bug d'UI, et invisible en support. Toute
  // écriture qui échoue remonte ici et s'affiche à l'écran.
  const [error, setError] = useState<string | null>(null);

  const runWrite = useCallback(async (context: string, work: () => Promise<void>) => {
    try {
      setError(null);
      await work();
    } catch (caught) {
      Sentry.captureException(caught, { extra: { context } });
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Recharge sur toute mutation des trois tables — y compris celles que la
    // sync écrira en arrière-plan en Phase 3, sans que cet écran change.
    //
    // Pas de chargement initial séparé : `withChangesForTables` est construit
    // sur `.pipe(startWith(null))` (source WatermelonDB 0.28), il émet donc
    // immédiatement à la souscription. Le premier rendu passe par ce même
    // callback, ce qui évite un `setState` synchrone dans le corps de l'effet
    // (react-hooks/set-state-in-effect) et garantit qu'il n'existe qu'un seul
    // chemin de chargement, sans course entre les deux.
    const subscription = database
      .withChangesForTables(['workouts', 'workout_exercises', 'sets'])
      .subscribe(() => {
        if (cancelled) return;
        loadView().then((next) => {
          if (cancelled) return;
          setView(next);
          setReady(true);
        });
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Crée la séance au premier ajout réel, pas à l'ouverture de l'écran :
  // ouvrir puis ressortir ne doit pas laisser une séance vide derrière soi.
  const ensureWorkout = useCallback(async (): Promise<Workout> => {
    const profileId = await currentProfileId();
    // Échec explicite plutôt qu'un `return null` avalé plus haut : sans
    // session, la séance ne peut pas être rattachée à un profil, et
    // l'utilisateur doit le savoir immédiatement.
    if (!profileId) throw new Error('Aucune session : impossible de créer la séance.');

    const existing = await findOpenWorkout(profileId);
    if (existing) return existing;

    return database.write(() =>
      database.get<Workout>('workouts').create((workout) => {
        workout.profileId = profileId;
        workout.startedAt = new Date();
        workout.isPrivate = false;
      }),
    );
  }, []);

  const addExercises = useCallback(
    async (exerciseIds: string[]) => {
      if (exerciseIds.length === 0) return;
      await runWrite('workout_add_exercises', async () => {
        const workout = await ensureWorkout();

        const existing = await database
          .get<WorkoutExercise>('workout_exercises')
          .query(Q.where('workout_id', workout.id))
          .fetchCount();

        await database.write(async () => {
          await database.batch(
            ...exerciseIds.map((exerciseId, offset) =>
              database.get<WorkoutExercise>('workout_exercises').prepareCreate((row) => {
                row.workoutId = workout.id;
                // ⚠️ Invariant du CHECK serveur (§2.6) : au moins un des deux
                // ids d'exercice. WatermelonDB ne peut pas l'exprimer, donc
                // c'est ici qu'il se tient.
                row.exerciseId = exerciseId;
                row.customExerciseId = null;
                row.orderIndex = existing + offset;
              }),
            ),
          );
        });
      });
    },
    [ensureWorkout, runWrite],
  );

  const addSet = useCallback(
    async (workoutExerciseId: string) => {
      await runWrite('workout_add_set', async () => {
        const setNumber =
          (await database
            .get<WorkoutSet>('sets')
            .query(Q.where('workout_exercise_id', workoutExerciseId), Q.where('deleted_at', null))
            .fetchCount()) + 1;

        await database.write(async () => {
          await database.get<WorkoutSet>('sets').create((row) => {
            row.workoutExerciseId = workoutExerciseId;
            row.setNumber = setNumber;
            row.weightKg = 0;
            row.reps = 0;
            row.isCompleted = false;
          });
        });
      });
    },
    [runWrite],
  );

  // Retire un exercice de la séance en cours (soft delete, comme tout le
  // reste — DATA_MODEL §2.6/§2.7). Ses séries sont soft-deletées avec lui
  // dans la MÊME écriture : les laisser en `deleted_at = null` créerait des
  // séries orphelines rattachées à un exercice qu'on ne peut plus valider
  // ni afficher — un vrai risque de sync, pas juste un détail d'UI.
  const removeExercise = useCallback(
    async (workoutExerciseId: string) => {
      await runWrite('workout_remove_exercise', async () => {
        const row = await database.get<WorkoutExercise>('workout_exercises').find(workoutExerciseId);
        const sets = await database
          .get<WorkoutSet>('sets')
          .query(Q.where('workout_exercise_id', workoutExerciseId), Q.where('deleted_at', null))
          .fetch();

        const deletedAt = new Date();
        await database.write(async () => {
          await database.batch(
            row.prepareUpdate((r) => {
              r.deletedAt = deletedAt;
            }),
            ...sets.map((set) =>
              set.prepareUpdate((s) => {
                s.deletedAt = deletedAt;
              }),
            ),
          );
        });
      });
    },
    [runWrite],
  );

  const updateSet = useCallback(
    async (setId: string, patch: { weightKg?: number; reps?: number; isCompleted?: boolean }) => {
      // Mise à jour OPTIMISTE de la vue, avant l'écriture.
      //
      // Sans elle, l'écran affichait brièvement l'ANCIENNE valeur entre le
      // moment où le tampon de frappe se vide et celui où la relecture
      // réactive livre la nouvelle — un flash visible à l'œil, rapporté sur
      // appareil le 2026-07-27 ("le 8 réapparaît avant le 10").
      // Le rechargement qui suit écrit la même valeur : aucun risque de
      // divergence, et en cas d'échec `runWrite` affiche l'erreur.
      setView((current) => {
        if (!current) return current;
        return {
          ...current,
          exercises: current.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? { ...set, ...patch } : set,
            ),
          })),
        };
      });

      await runWrite('workout_update_set', async () => {
        const row = await database.get<WorkoutSet>('sets').find(setId);
        await database.write(async () => {
          await row.update((set) => {
            if (patch.weightKg !== undefined) set.weightKg = patch.weightKg;
            if (patch.reps !== undefined) set.reps = patch.reps;
            if (patch.isCompleted !== undefined) set.isCompleted = patch.isCompleted;
          });
        });
      });
    },
    [runWrite],
  );

  // Termine la séance en cours (ROADMAP 2.11) : seul `completed_at` distingue
  // une séance ouverte d'une séance terminée (DATA_MODEL §2.5). Le volume
  // total est figé ici plutôt que recalculé à chaque lecture — le résumé
  // peak-end doit rester correct même si des sets sont modifiés plus tard.
  //
  // ⚠️ Calculé depuis une lecture DIRECTE en base, jamais depuis `view` :
  // `view` est un state React qui peut ne pas avoir encore absorbé la toute
  // dernière écriture (ex. "Terminer la séance" tapé juste après avoir
  // validé la dernière série, avant que la souscription réactive ne
  // rafraîchisse `view`) — même classe de bug que celle corrigée dans
  // `getSetSnapshot` ci-dessus.
  const finishWorkout = useCallback(async (): Promise<string | null> => {
    const profileId = await currentProfileId();
    if (!profileId) return null;
    const workout = await findOpenWorkout(profileId);
    if (!workout) return null;

    let finishedId: string | null = null;
    await runWrite('workout_finish', async () => {
      const workoutExercises = await database
        .get<WorkoutExercise>('workout_exercises')
        .query(Q.where('workout_id', workout.id), Q.where('deleted_at', null))
        .fetch();
      const completedSets =
        workoutExercises.length === 0
          ? []
          : await database
              .get<WorkoutSet>('sets')
              .query(
                Q.where('workout_exercise_id', Q.oneOf(workoutExercises.map((we) => we.id))),
                Q.where('is_completed', true),
                Q.where('deleted_at', null),
              )
              .fetch();
      const totalVolumeKg = completedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);

      await database.write(async () => {
        await workout.update((row) => {
          row.completedAt = new Date();
          row.totalVolumeKg = totalVolumeKg;
        });
      });
      finishedId = workout.id;
    });
    return finishedId;
  }, [runWrite]);

  return { view, ready, error, addExercises, addSet, updateSet, removeExercise, finishWorkout };
}
