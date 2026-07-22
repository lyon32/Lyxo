import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { setStoredLanguage } from '../../lib/onboarding-storage';

// Écran 1bis — premier écran absolu, avant même l'auth (CLAUDE.md règle
// language.tsx). Pas de skip : bloquant.
export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<'fr' | 'en'>('fr');

  const handleContinue = async () => {
    await i18n.changeLanguage(selected);
    await setStoredLanguage(selected);
    router.replace('/onboarding/welcome');
  };

  return (
    <View className="flex-1 items-center justify-between gap-8 bg-bg px-6 py-16">
      <Image
        source={require('../../assets/brand/lyxo-wordmark-white.png')}
        style={{ width: 120, height: 36 }}
        contentFit="contain"
      />

      <View className="w-full gap-4">
        <Pressable
          onPress={() => setSelected('fr')}
          className={`w-full items-center rounded-full border px-6 py-4 ${
            selected === 'fr' ? 'border-ember bg-card' : 'border-border bg-card'
          }`}
        >
          <Text className="text-fg">{t('onboarding.language.french')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setSelected('en')}
          className={`w-full items-center rounded-full border px-6 py-4 ${
            selected === 'en' ? 'border-ember bg-card' : 'border-border bg-card'
          }`}
        >
          <Text className="text-fg">{t('onboarding.language.english')}</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleContinue}
        className="w-full items-center rounded-2xl bg-ember px-6 py-4"
      >
        <Text className="text-fg">{t('onboarding.language.continue')}</Text>
      </Pressable>
    </View>
  );
}
