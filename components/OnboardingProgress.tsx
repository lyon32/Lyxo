import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Jauge 3 étapes (Objectif → Split → Compte) — jamais à 0%, la 1ère
// étape apparaît déjà acquise dès l'écran Objectif (UI prompt règle 14).
export function OnboardingProgress({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useTranslation();

  return (
    <View className="items-center gap-2">
      <Text className="text-muted">{t('onboarding.step', { current })}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            className={`h-2 w-2 rounded-full ${step <= current ? 'bg-ember' : 'bg-steel'}`}
          />
        ))}
      </View>
    </View>
  );
}
