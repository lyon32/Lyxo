import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <View className="w-full rounded-2xl border border-border bg-card p-6">
        <Text className="text-fg">{t('home.test_title')}</Text>
        <Text className="mt-1 text-muted">{t('home.test_subtitle')}</Text>
      </View>
      <Pressable className="w-full items-center rounded-2xl bg-ember px-6 py-4">
        <Text className="text-fg">{t('home.cta')}</Text>
      </Pressable>
    </View>
  );
}
