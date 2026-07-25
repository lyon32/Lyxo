import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import type { Exercise } from '../lib/exercises-store';
import { equipmentI18nKey } from '../lib/exercise-labels';
import { embeddedThumbFor } from '../lib/exercise-image';

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress: () => void;
}

export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === 'en' ? exercise.name_en : exercise.name_fr;

  // Pack embarqué : vignette locale (offline, zéro data). Sinon 1re frame du
  // GIF distant (autoplay off = statique). Dans la liste, jamais d'animation.
  const localThumb = embeddedThumbFor(exercise);
  const thumbSource = localThumb != null ? localThumb : exercise.gif_url ? { uri: exercise.gif_url } : null;

  return (
    <Pressable
      onPress={onPress}
      className="min-h-tap flex-row items-center gap-4 border-b border-border py-3"
    >
      <View className="h-14 w-14 overflow-hidden rounded-2xl bg-skeleton">
        {thumbSource ? (
          <Image
            source={thumbSource}
            style={{ width: 56, height: 56 }}
            contentFit="cover"
            cachePolicy="disk"
            autoplay={false}
          />
        ) : null}
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-fg" numberOfLines={1}>
          {name}
        </Text>
        {exercise.equipment ? (
          <Text className="text-sm text-muted">{t(equipmentI18nKey(exercise.equipment))}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
