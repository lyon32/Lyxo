import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// v2 uniquement (marketplace coach — programmes payants) — ROADMAP.md
// PRIORITÉ NIVEAU 2bis/3, LLD.md §6.1. Vide en v1 par design.
export default function ShopScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-fg">{t('shop.header_title')}</Text>
      <Text className="mt-1 text-muted">{t('shop.placeholder')}</Text>
    </View>
  );
}
