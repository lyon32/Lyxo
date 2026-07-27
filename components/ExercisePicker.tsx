import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from './EmptyState';
import { ExerciseListItem } from './ExerciseListItem';
import { MuscleFilterChips } from './MuscleFilterChips';
import { useRecentExerciseIds } from '../db/use-recent-exercises';
import { muscleGroupI18nKey } from '../lib/exercise-labels';
import { type Exercise, useExercisesStore } from '../lib/exercises-store';

type PickerTab = 'all' | 'recent' | 'custom';

interface ExercisePickerProps {
  // MODE SÉLECTION (sheet du flux de séance) : chaque ligne devient un toggle
  // à coche. Absent => MODE NAVIGATION (onglet Log, Actions → Exercises), la
  // ligne ouvre le détail via `onPressExercise`.
  selection?: {
    selectedIds: string[];
    onToggle: (exercise: Exercise) => void;
  };
  onPressExercise?: (exercise: Exercise) => void;
}

// ⚠️ COMPOSANT PARTAGÉ, PAS UN ÉCRAN (LLD.md §6.5bis). La même UI sert trois
// surfaces : le sheet "Add Exercise" du flux de séance, l'onglet Log de la
// tab bar (§6.1) et Actions → Exercises en plein écran (§6.5). Une seule
// liste, un seul jeu de filtres — la logique de sélection reste agnostique de
// la surface d'affichage, d'où l'absence volontaire ici de tout chrome
// d'écran (header, padding de page, Modal) : c'est au parent de le fournir.
export function ExercisePicker({ selection, onPressExercise }: ExercisePickerProps) {
  const { t } = useTranslation();
  const exercises = useExercisesStore((s) => s.exercises);
  const status = useExercisesStore((s) => s.status);
  const load = useExercisesStore((s) => s.load);

  const [activeTab, setActiveTab] = useState<PickerTab>('all');
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const muscleGroups = useMemo(() => {
    const unique = [...new Set(exercises.map((e) => e.muscle_group))];
    return unique.sort((a, b) => t(muscleGroupI18nKey(a)).localeCompare(t(muscleGroupI18nKey(b))));
  }, [exercises, t]);

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (muscleFilter && e.muscle_group !== muscleFilter) return false;
      if (!lower) return true;
      return e.name_fr.toLowerCase().includes(lower) || e.name_en.toLowerCase().includes(lower);
    });
  }, [exercises, query, muscleFilter]);

  return (
    <View className="flex-1">
      {/* Structure à 3 onglets définitive (§6.5bis) — Recent et Custom sont
          présents et vides, jamais masqués. Même style de pills soulignées
          que les sous-tabs Feed/Discover de Search (§6.1). */}
      <View className="mb-4 flex-row gap-6">
        <TabPill label={t('exercises.tabs.all')} active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
        <TabPill
          label={t('exercises.tabs.recent')}
          active={activeTab === 'recent'}
          onPress={() => setActiveTab('recent')}
        />
        <TabPill
          label={t('exercises.tabs.custom')}
          active={activeTab === 'custom'}
          onPress={() => setActiveTab('custom')}
        />
      </View>

      {activeTab === 'all' ? (
        <AllTab
          exercises={exercises}
          filtered={filtered}
          muscleGroups={muscleGroups}
          muscleFilter={muscleFilter}
          onSelectMuscle={setMuscleFilter}
          query={query}
          onChangeQuery={setQuery}
          status={status}
          onRetry={load}
          selection={selection}
          onPressExercise={onPressExercise}
        />
      ) : activeTab === 'recent' ? (
        // Alimenté depuis ROADMAP 2.6 par l'historique local des séances
        // (`workout_exercises`) — l'état vide ne subsiste que tant qu'aucune
        // séance n'a été loggée.
        <RecentTab
          exercises={exercises}
          selection={selection}
          onPressExercise={onPressExercise}
        />
      ) : (
        // Lira `custom_exercises` (DATA_MODEL §2.4, table créée en ROADMAP
        // 2.2) une fois son store client écrit — avec le "+ Create" inline et
        // le traitement de CUSTOM_EXERCISE_LIMIT_REACHED comme réponse
        // NORMALE de la base (§6.5bis), jamais comme une erreur technique.
        <EmptyState
          title={t('exercises.custom_empty_title')}
          description={t('exercises.custom_empty_description')}
        />
      )}
    </View>
  );
}

interface AllTabProps {
  exercises: Exercise[];
  filtered: Exercise[];
  muscleGroups: string[];
  muscleFilter: string | null;
  onSelectMuscle: (muscleGroup: string | null) => void;
  query: string;
  onChangeQuery: (value: string) => void;
  status: ReturnType<typeof useExercisesStore.getState>['status'];
  onRetry: () => void;
  selection?: ExercisePickerProps['selection'];
  onPressExercise?: (exercise: Exercise) => void;
}

// Recherche et chips ne sont rendues que sur "All" : sur Recent/Custom elles
// piloteraient une liste vide, donc des contrôles morts.
function AllTab({
  exercises,
  filtered,
  muscleGroups,
  muscleFilter,
  onSelectMuscle,
  query,
  onChangeQuery,
  status,
  onRetry,
  selection,
  onPressExercise,
}: AllTabProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder={t('exercises.search_placeholder')}
        placeholderTextColor="#8E8781"
        autoCapitalize="none"
        className="mb-4 h-14 rounded-2xl bg-input px-4 text-fg"
      />

      {exercises.length > 0 ? (
        <View className="mb-2">
          <MuscleFilterChips
            muscleGroups={muscleGroups}
            selected={muscleFilter}
            onSelect={onSelectMuscle}
          />
        </View>
      ) : null}

      {status === 'loading' || status === 'idle' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C73E3A" />
        </View>
      ) : status === 'error' ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-center text-muted">{t('exercises.load_error')}</Text>
          <Pressable onPress={onRetry} className="rounded-2xl bg-ember px-6 py-4">
            <Text className="text-fg">{t('exercises.retry')}</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('exercises.empty_state')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ExerciseListItem
              exercise={item}
              selected={selection ? selection.selectedIds.includes(item.id) : undefined}
              onPress={() => (selection ? selection.onToggle(item) : onPressExercise?.(item))}
            />
          )}
        />
      )}
    </View>
  );
}

interface RecentTabProps {
  exercises: Exercise[];
  selection?: ExercisePickerProps['selection'];
  onPressExercise?: (exercise: Exercise) => void;
}

// Ni recherche ni chips ici : la liste est courte et déjà ordonnée par
// fraîcheur d'usage — la filtrer casserait justement ce qui en fait l'intérêt.
function RecentTab({ exercises, selection, onPressExercise }: RecentTabProps) {
  const { t } = useTranslation();
  const { ids, ready } = useRecentExerciseIds();

  // L'ordre vient de l'historique, pas du référentiel : on résout les ids
  // dans leur ordre de récence et on écarte ceux que le référentiel ne
  // connaît pas (encore) — il arrive du réseau, l'historique est local.
  const recent = useMemo(() => {
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    return ids
      .map((id) => byId.get(id))
      .filter((exercise): exercise is Exercise => exercise !== undefined);
  }, [ids, exercises]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#C73E3A" />
      </View>
    );
  }

  if (recent.length === 0) {
    return (
      <EmptyState
        title={t('exercises.recent_empty_title')}
        description={t('exercises.recent_empty_description')}
      />
    );
  }

  return (
    <FlatList
      data={recent}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <ExerciseListItem
          exercise={item}
          selected={selection ? selection.selectedIds.includes(item.id) : undefined}
          onPress={() => (selection ? selection.onToggle(item) : onPressExercise?.(item))}
        />
      )}
    />
  );
}

function TabPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text className={active ? 'font-inter-semibold text-fg' : 'text-muted'}>{label}</Text>
      {active ? <View className="mt-1 h-0.5 w-full bg-ember" /> : null}
    </Pressable>
  );
}
