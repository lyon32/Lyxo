import { Pressable, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { muscleGroupI18nKey } from '../lib/exercise-labels';

interface MuscleFilterChipsProps {
  muscleGroups: string[];
  selected: string | null;
  onSelect: (muscleGroup: string | null) => void;
}

export function MuscleFilterChips({ muscleGroups, selected, onSelect }: MuscleFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      <Chip label={t('exercises.filter_all')} active={selected === null} onPress={() => onSelect(null)} />
      {muscleGroups.map((muscleGroup) => (
        <Chip
          key={muscleGroup}
          label={t(muscleGroupI18nKey(muscleGroup))}
          active={selected === muscleGroup}
          onPress={() => onSelect(muscleGroup)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-3 ${active ? 'border-ember bg-ember' : 'border-border bg-card'}`}
    >
      <Text className={active ? 'text-fg' : 'text-muted'}>{label}</Text>
    </Pressable>
  );
}
