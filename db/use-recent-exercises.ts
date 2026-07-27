import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';

import { database } from './index';
import type { WorkoutExercise } from './models/WorkoutExercise';

// Combien de lignes `workout_exercises` on balaie pour reconstituer la liste.
// Un même exercice revient souvent d'une séance à l'autre, donc il en faut
// nettement plus que le nombre d'entrées voulues en sortie.
const SCAN_LIMIT = 200;
const DEFAULT_LIMIT = 20;

async function loadRecentExerciseIds(limit: number): Promise<string[]> {
  const rows = await database
    .get<WorkoutExercise>('workout_exercises')
    .query(Q.where('deleted_at', null), Q.sortBy('created_at', Q.desc), Q.take(SCAN_LIMIT))
    .fetch();

  // Dédoublonnage en conservant l'ordre : la première occurrence rencontrée
  // est la plus récente, c'est celle qui fixe la position.
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const row of rows) {
    const exerciseId = row.exerciseId;
    // Les exercices perso (`custom_exercise_id`) sont ignorés ici : ils ont
    // leur propre onglet, et le référentiel ne sait pas les résoudre.
    if (!exerciseId || seen.has(exerciseId)) continue;
    seen.add(exerciseId);
    ids.push(exerciseId);
    if (ids.length >= limit) break;
  }
  return ids;
}

// Exercices récemment utilisés, alimentés par l'historique local des séances
// (ROADMAP 2.6). Avant cette tâche l'onglet Recent n'avait aucune source de
// données possible — c'était la réserve inscrite sous 2.3.
export function useRecentExerciseIds(limit: number = DEFAULT_LIMIT) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // `withChangesForTables` émet immédiatement (`startWith(null)`), donc ce
    // seul callback couvre aussi le chargement initial — pas de `setState`
    // synchrone dans le corps de l'effet.
    const subscription = database
      .withChangesForTables(['workout_exercises'])
      .subscribe(() => {
        if (cancelled) return;
        loadRecentExerciseIds(limit).then((next) => {
          if (cancelled) return;
          setIds(next);
          setReady(true);
        });
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [limit]);

  return { ids, ready };
}
