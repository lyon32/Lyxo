import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

// Écran 1ter — PHOTO HERO EXCEPTION (LYXO_UI_PROMPT.md) : ce screen doit
// porter un vrai hero photo (stock photo authentique, jamais IA générée,
// WebP ≤200Ko bundlé). Asset pas encore fourni — fond sombre uni en
// attendant, aucune image factice ajoutée à sa place.
// Fusion pitch + promesse offline (arbitrage fiche 5 comité) : ce message
// vit UNIQUEMENT ici dans le parcours pré-auth.
export default function WelcomeScreen() {
  const { t } = useTranslation();

  const goNext = () => router.push('/onboarding/goal');

  return (
    <View className="flex-1 justify-between bg-bg px-6 py-16">
      <View className="items-end">
        <Pressable onPress={goNext}>
          <Text className="text-muted">{t('onboarding.welcome.skip')}</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        <View className="flex-row justify-center gap-2">
          <View className="h-2 w-2 rounded-full bg-ember" />
          <View className="h-2 w-2 rounded-full bg-steel" />
          <View className="h-2 w-2 rounded-full bg-steel" />
        </View>
        <Text className="text-center text-4xl font-bold text-fg">
          {t('onboarding.welcome.headline')}
        </Text>
        <Text className="text-center text-muted">{t('onboarding.welcome.subtitle')}</Text>
      </View>

      <View className="gap-4">
        <Pressable onPress={goNext} className="w-full items-center rounded-2xl bg-ember px-6 py-4">
          <Text className="text-fg">{t('onboarding.welcome.cta')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth')}>
          <Text className="text-center text-muted">{t('onboarding.welcome.already_account')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
