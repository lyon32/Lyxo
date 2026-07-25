import { Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';

import type { Exercise } from '../lib/exercises-store';
import { equipmentI18nKey, muscleGroupI18nKey } from '../lib/exercise-labels';
import { embeddedThumbFor } from '../lib/exercise-image';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const { t, i18n } = useTranslation();

  if (!exercise) return null;
  const name = i18n.language === 'en' ? exercise.name_en : exercise.name_fr;

  // Pack embarqué : la vignette locale sert de placeholder offline instantané
  // sous le GIF animé distant (et de repli si pas de gif_url / hors-ligne).
  const localThumb = embeddedThumbFor(exercise);

  return (
    <Modal visible={!!exercise} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-bg px-6 py-16">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="flex-1 pr-4 text-xl text-fg">{name}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X color="#F5F1EC" size={24} />
          </Pressable>
        </View>

        <View className="aspect-square w-full overflow-hidden rounded-card bg-skeleton">
          {exercise.gif_url ? (
            <Image
              source={{ uri: exercise.gif_url }}
              placeholder={localThumb ?? undefined}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              cachePolicy="disk"
            />
          ) : localThumb != null ? (
            <Image
              source={localThumb}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              cachePolicy="disk"
            />
          ) : null}
        </View>

        <View className="mt-6 gap-4">
          <View className="flex-row justify-between border-b border-border pb-4">
            <Text className="text-muted">{t('exercises.muscle_group_label')}</Text>
            <Text className="text-fg">{t(muscleGroupI18nKey(exercise.muscle_group))}</Text>
          </View>
          {exercise.equipment ? (
            <View className="flex-row justify-between border-b border-border pb-4">
              <Text className="text-muted">{t('exercises.equipment_label')}</Text>
              <Text className="text-fg">{t(equipmentI18nKey(exercise.equipment))}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
