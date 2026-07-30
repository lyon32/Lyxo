import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from './supabase';

export interface Exercise {
  id: string;
  external_id: string | null;
  name_fr: string;
  name_en: string;
  muscle_group: string;
  equipment: string | null;
  gif_url: string | null;
  is_embedded_pack: boolean;
}

type ExercisesStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface ExercisesState {
  exercises: Exercise[];
  status: ExercisesStatus;
  load: () => Promise<void>;
}

// Référentiel statique en lecture seule (DATA_MODEL.md §2.3, RLS
// exercises_select_all) : ~200 lignes, PERSISTÉES localement (AsyncStorage)
// — ROADMAP 2.12 (DoD mode avion). Sans ce cache, une app tuée en plein
// séance (courant sur un device bas de gamme, exactement le scénario visé
// par le DoD) et rouverte en mode avion perdait tout accès au sélecteur
// d'exercices : `exercises: []` tant que le réseau ne répondait pas,
// impossible d'ajouter un exercice hors ligne. Le cache s'affiche
// IMMÉDIATEMENT au démarrage (réhydraté), le réseau ne fait que le
// rafraîchir en arrière-plan — jamais l'utilisateur ne doit attendre
// derrière un appel réseau pour voir une liste qu'il avait déjà.
//
// `_fetchedFresh` (interne, non persisté) : distinct de `status`, qui sert
// l'AFFICHAGE (ExercisePicker). Sans lui, un échec réseau en mode avion avec
// cache présent laisserait `status` à sa valeur d'avant l'appel — jamais
// 'loaded' ni 'error' — et l'écran resterait bloqué sur le spinner que
// `ExercisePicker` affiche pour 'idle'/'loading'.
export const useExercisesStore = create<ExercisesState & { _fetchedFresh: boolean }>()(
  persist(
    (set, get) => ({
      exercises: [],
      status: 'idle',
      _fetchedFresh: false,

      load: async () => {
        if (get().status === 'loading' || get()._fetchedFresh) return;
        const hasCache = get().exercises.length > 0;
        // Cache déjà là : on le montre tel quel (status 'loaded') pendant le
        // rafraîchissement plutôt que de repasser par un spinner qui
        // masquerait des données déjà valides.
        set({ status: hasCache ? 'loaded' : 'loading' });

        const { data, error } = await supabase
          .from('exercises')
          .select('id, external_id, name_fr, name_en, muscle_group, equipment, gif_url, is_embedded_pack')
          .order('name_fr');

        if (error) {
          Sentry.captureException(error, { extra: { context: 'exercises_load' } });
          // Un cache valide ne doit JAMAIS être écrasé par un échec réseau
          // (mode avion = cas normal, pas une anomalie) — seule l'absence
          // totale de données bascule l'écran en état d'erreur (LLD §6.0).
          if (!hasCache) set({ status: 'error' });
          return;
        }
        set({ exercises: data ?? [], status: 'loaded', _fetchedFresh: true });
      },
    }),
    {
      name: 'lyxo-exercises-cache',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ exercises: state.exercises }),
    },
  ),
);
