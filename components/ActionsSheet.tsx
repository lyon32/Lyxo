import { Modal, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  ChevronRight,
  Dumbbell,
  Heart,
  MessageSquare,
  ShoppingBag,
  Utensils,
} from 'lucide-react-native';

interface ActionsSheetProps {
  visible: boolean;
  onClose: () => void;
}

// v1 actif vs stubs (ROADMAP.md 4.11 / LLD.md §6.5) : Exercises est la
// seule destination réellement construite pour l'instant (réutilise
// app/(tabs)/log.tsx). Physique/Feedback sont v1 mais pas encore
// implémentés cette passe ; Health/Nutrition/Programs sont v2 — tous
// affichés grisés avec un tag "Bientôt" plutôt que des écrans morts.
const ITEMS = [
  { key: 'exercises', Icon: Dumbbell, active: true, onPress: () => router.push('/log') },
  { key: 'physique', Icon: Camera, active: false },
  { key: 'feedback', Icon: MessageSquare, active: false },
  { key: 'health', Icon: Heart, active: false },
  { key: 'nutrition', Icon: Utensils, active: false },
  { key: 'programs', Icon: ShoppingBag, active: false },
] as const;

export function ActionsSheet({ visible, onClose }: ActionsSheetProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="absolute bottom-0 w-full rounded-t-3xl bg-steel px-6 pb-10 pt-6">
        <View className="mb-2 items-center">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>
        <Text className="mb-4 text-lg text-fg">{t('actions.title')}</Text>

        {ITEMS.map(({ key, Icon, active, ...rest }, index) => (
          <Pressable
            key={key}
            disabled={!active}
            onPress={active && 'onPress' in rest ? rest.onPress : undefined}
            className={`min-h-tap flex-row items-center gap-4 py-3 ${
              index < ITEMS.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-card">
              <Icon color={active ? '#F5F1EC' : '#8E8781'} size={20} />
            </View>
            <Text className={`flex-1 ${active ? 'text-fg' : 'text-muted'}`}>
              {t(`actions.${key}`)}
            </Text>
            {active ? (
              <ChevronRight color="#8E8781" size={20} />
            ) : (
              <Text className="text-xs text-muted">{t('actions.coming_soon')}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}
