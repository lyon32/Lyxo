import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseDetailModal } from '../../components/ExerciseDetailModal';
import { ExerciseListItem } from '../../components/ExerciseListItem';
import { MuscleFilterChips } from '../../components/MuscleFilterChips';
import { muscleGroupI18nKey } from '../../lib/exercise-labels';
import { type Exercise, useExercisesStore } from '../../lib/exercises-store';

export default function LogScreen() {
  const { t } = useTranslation();
  const exercises = useExercisesStore((s) => s.exercises);
  const status = useExercisesStore((s) => s.status);
  const load = useExercisesStore((s) => s.load);

  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
    <View className="flex-1 bg-bg px-6 pt-16">
      <Text className="mb-4 text-2xl text-fg">{t('exercises.header_title')}</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('exercises.search_placeholder')}
        placeholderTextColor="#8E8781"
        autoCapitalize="none"
        className="mb-4 h-14 rounded-2xl bg-input px-4 text-fg"
      />

      {exercises.length > 0 ? (
        <View className="mb-2">
          <MuscleFilterChips muscleGroups={muscleGroups} selected={muscleFilter} onSelect={setMuscleFilter} />
        </View>
      ) : null}

      {status === 'loading' || status === 'idle' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C73E3A" />
        </View>
      ) : status === 'error' ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-center text-muted">{t('exercises.load_error')}</Text>
          <Pressable onPress={load} className="rounded-2xl bg-ember px-6 py-4">
            <Text className="text-fg">{t('exercises.retry')}</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-muted">{t('exercises.empty_state')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ExerciseListItem exercise={item} onPress={() => setSelectedExercise(item)} />
          )}
        />
      )}

      <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </View>
  );
}
