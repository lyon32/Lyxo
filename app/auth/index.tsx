import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Placeholder temporaire — écrans réels (signup/login/reset password,
// UI prompt écrans 3/3bis/3quater) construits à la tâche ROADMAP 1.6.
export default function AuthPlaceholderScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-bg px-6">
      <Text className="text-fg">{t('auth.placeholder_title')}</Text>
      <Text className="text-muted">{t('auth.placeholder_subtitle')}</Text>
    </View>
  );
}
