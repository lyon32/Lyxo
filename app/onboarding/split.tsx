import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { OnboardingProgress } from '../../components/OnboardingProgress';
import { SelectableCard } from '../../components/SelectableCard';
import { OnboardingSplit, setOnboardingSplit } from '../../lib/onboarding-storage';
import { goBackSafely } from '../../lib/safe-back';

export default function SplitScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<OnboardingSplit | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await setOnboardingSplit(selected);
    router.push('/auth');
  };

  return (
    <View className="flex-1 justify-between bg-bg px-6 py-16">
      <View className="gap-4">
        <Pressable onPress={() => goBackSafely('/onboarding/goal')}>
          <ChevronLeft color="#F5F1EC" size={28} />
        </Pressable>
        <OnboardingProgress current={2} />
      </View>

      <View className="gap-4">
        <Text className="text-center text-2xl text-fg">{t('onboarding.split.title')}</Text>
        <SelectableCard
          title={t('onboarding.split.ppl')}
          subtitle={t('onboarding.split.ppl_days')}
          selected={selected === 'ppl'}
          onPress={() => setSelected('ppl')}
        />
        <SelectableCard
          title={t('onboarding.split.upper_lower')}
          subtitle={t('onboarding.split.upper_lower_days')}
          selected={selected === 'upper_lower'}
          onPress={() => setSelected('upper_lower')}
        />
        <SelectableCard
          title={t('onboarding.split.full_body')}
          subtitle={t('onboarding.split.full_body_days')}
          selected={selected === 'full_body'}
          onPress={() => setSelected('full_body')}
        />
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={!selected}
        className={`w-full items-center rounded-2xl px-6 py-4 ${
          selected ? 'bg-ember' : 'bg-steel'
        }`}
      >
        <Text className="text-fg">{t('onboarding.split.cta')}</Text>
      </Pressable>
    </View>
  );
}
