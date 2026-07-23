import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { OnboardingProgress } from '../../components/OnboardingProgress';
import { SelectableCard } from '../../components/SelectableCard';
import { OnboardingGoal, setOnboardingGoal } from '../../lib/onboarding-storage';
import { goBackSafely } from '../../lib/safe-back';

export default function GoalScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<OnboardingGoal | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await setOnboardingGoal(selected);
    router.push('/onboarding/split');
  };

  return (
    <View className="flex-1 justify-between bg-bg px-6 py-16">
      <View className="gap-4">
        <Pressable onPress={() => goBackSafely('/onboarding/welcome')}>
          <ChevronLeft color="#F5F1EC" size={28} />
        </Pressable>
        <OnboardingProgress current={1} />
      </View>

      <View className="gap-4">
        <Text className="text-center text-2xl text-fg">{t('onboarding.goal.title')}</Text>
        <SelectableCard
          title={t('onboarding.goal.force')}
          selected={selected === 'force'}
          onPress={() => setSelected('force')}
        />
        <SelectableCard
          title={t('onboarding.goal.masse')}
          selected={selected === 'masse'}
          onPress={() => setSelected('masse')}
        />
        <SelectableCard
          title={t('onboarding.goal.regularite')}
          selected={selected === 'regularite'}
          onPress={() => setSelected('regularite')}
        />
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={!selected}
        className={`w-full items-center rounded-2xl px-6 py-4 ${
          selected ? 'bg-ember' : 'bg-steel'
        }`}
      >
        <Text className="text-fg">{t('onboarding.goal.cta')}</Text>
      </Pressable>
    </View>
  );
}
