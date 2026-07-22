import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-fg">{t('nav.profile')}</Text>
    </View>
  );
}
