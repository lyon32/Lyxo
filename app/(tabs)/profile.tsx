import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../lib/auth-store';

// Écran Profil réel construit à la tâche 4.4 — bouton déconnexion ajouté
// ici en avance, uniquement pour pouvoir tester les flows auth (1.6).
export default function ProfileScreen() {
  const { t } = useTranslation();
  const signOut = useAuthStore((s) => s.signOut);

  // Pas de navigation explicite ici : useOnboardingGate ((tabs)/_layout.tsx)
  // est l'unique source de vérité de navigation post-auth — il redirige déjà
  // vers /auth dès que authStatus passe à 'signed-out' (audit doc : une
  // double navigation vers deux routes différentes était redondante/fragile).
  const handleSignOut = async () => {
    await signOut();
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
