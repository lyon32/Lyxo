import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <View className="mb-8 flex-row items-center gap-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft color="#F5F1EC" size={24} />
        </Pressable>
        <Text className="text-xl text-fg">{t('notifications.header_title')}</Text>
      </View>

      <View className="flex-1 items-center justify-center pb-16">
        <Text className="text-xl text-fg">{t('notifications.empty_title')}</Text>
        <Text className="mt-2 text-center text-muted">{t('notifications.empty_subtitle')}</Text>
      </View>
    </View>
  );
}
