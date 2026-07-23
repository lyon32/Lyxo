import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { useAuthStore } from '../../lib/auth-store';

// Écran Profil réel construit à la tâche 4.4 — bouton déconnexion ajouté
// ici en avance, uniquement pour pouvoir tester les flows auth (1.6).
export default function ProfileScreen() {
  const { t } = useTranslation();
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-bg px-6">
      <Text className="text-fg">{t('nav.profile')}</Text>
      <Pressable
        onPress={handleSignOut}
        className="items-center rounded-2xl border border-border bg-card px-6 py-4"
      >
        <Text className="text-fg">{t('profile.sign_out')}</Text>
      </Pressable>
    </View>
  );
}
