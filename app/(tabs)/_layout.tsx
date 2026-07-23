import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Compass, Dumbbell, House, TrendingUp, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useOnboardingGate } from '../../lib/use-onboarding-gate';

// Gate vérifié ici (pas juste sur l'onglet Accueil) : une déconnexion
// déclenchée depuis n'importe quel onglet doit rediriger vers l'auth.
export default function TabsLayout() {
  const { t } = useTranslation();
  const gateStatus = useOnboardingGate();

  useEffect(() => {
    if (gateStatus === 'needs-onboarding') {
      router.replace('/onboarding/language');
    } else if (gateStatus === 'needs-auth') {
      router.replace('/auth');
    }
  }, [gateStatus]);

  if (gateStatus !== 'ready') {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C73E3A',
        tabBarInactiveTintColor: '#8E8781',
        tabBarStyle: {
          backgroundColor: '#151312',
          borderTopColor: '#2C2826',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('nav.log'),
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('nav.progress'),
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('nav.discover'),
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
