import * as Sentry from '@sentry/react-native';
import { create } from 'zustand';

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
// exercises_select_all) : ~200 lignes, chargées une fois et gardées en
// mémoire pour la session — pas de pagination, pas de sync WatermelonDB
// nécessaire pour ce lot.
export const useExercisesStore = create<ExercisesState>((set, get) => ({
  exercises: [],
  status: 'idle',

  load: async () => {
    if (get().status === 'loading' || get().status === 'loaded') return;
    set({ status: 'loading' });

    const { data, error } = await supabase
      .from('exercises')
      .select('id, external_id, name_fr, name_en, muscle_group, equipment, gif_url, is_embedded_pack')
      .order('name_fr');

    if (error) {
      Sentry.captureException(error, { extra: { context: 'exercises_load' } });
      set({ status: 'error' });
      return;
    }
    set({ exercises: data ?? [], status: 'loaded' });
  },
}));
