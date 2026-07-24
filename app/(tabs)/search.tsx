import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Placeholder temporaire (tâche 1.1) — décision finale masquer/contenu réel
// à trancher au Bloc A3 (LYXO_UI_PROMPT.md §Navigation, "jamais un écran vide").
export default function DiscoverScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-fg">{t('nav.discover')}</Text>
      <Text className="mt-1 text-muted">{t('discover.placeholder')}</Text>
    </View>
  );
}
