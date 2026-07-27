import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChartColumn, Dumbbell, Ellipsis, LayoutGrid, Search, ShoppingBag } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { ActionsSheet } from '../../components/ActionsSheet';
import { useOnboardingGate } from '../../lib/use-onboarding-gate';

// Gate vérifié ici (pas juste sur l'onglet Accueil) : une déconnexion
// déclenchée depuis n'importe quel onglet doit rediriger vers l'auth.
export default function TabsLayout() {
  const gateStatus = useOnboardingGate();

  useEffect(() => {
    if (gateStatus === 'needs-onboarding') {
      router.replace('/onboarding/language');
    } else if (gateStatus === 'needs-auth') {
      router.replace('/auth');
    } else if (gateStatus === 'needs-post-auth') {
      router.replace('/onboarding/onboarding-details');
    }
  }, [gateStatus]);

  if (gateStatus !== 'ready') {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="shop" />
      {/* profile : retiré de la tab bar (LLD.md §6.1), accessible via
          l'avatar du Home. `href: null` le masque de tout affichage par
          défaut sans le retirer du routeur. */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

// Pas de dépendance directe sur @react-navigation/bottom-tabs (vendée en
// interne par expo-router, pas un package top-level résoluble) — le type
// du renderer est dérivé structurellement depuis <Tabs> lui-même.
type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
type FloatingTabBarProps = Parameters<TabBarRenderer>[0];

const TAB_ITEMS = [
  { name: 'index', Icon: LayoutGrid, labelKey: 'nav.home' },
  // Remis dans la barre à la demande de Lionel (2026-07-24) — s'écarte de
  // l'image de référence (4 icônes + "..."), qui n'a pas de Log distinct.
  { name: 'log', Icon: Dumbbell, labelKey: 'nav.log' },
  { name: 'search', Icon: Search, labelKey: 'nav.search' },
  { name: 'progress', Icon: ChartColumn, labelKey: 'nav.progress' },
  { name: 'shop', Icon: ShoppingBag, labelKey: 'nav.shop' },
] as const;

// Pilule flottante steel translucide + bouton rond Actions séparé
// (RÉFÉRENCE DESIGN, 2026-07-24 — voir LYXO_UI_PROMPT.md §Redesign additif).
function FloatingTabBar({ state, navigation }: FloatingTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [actionsVisible, setActionsVisible] = useState(false);
  const focusedName = state.routes[state.index]?.name;

  return (
    <View
      className="flex-row items-center gap-3 bg-bg px-6"
      style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 8 }}
    >
      <View className="flex-1 flex-row items-center justify-between rounded-full bg-steel/80 px-2 py-2">
        {TAB_ITEMS.map(({ name, Icon, labelKey }) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const isFocused = focusedName === name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(name);
            }
          };

          return (
            <Pressable
              key={name}
              onPress={onPress}
              accessibilityLabel={t(labelKey)}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isFocused ? 'bg-ember/20' : ''
              }`}
            >
              <Icon color={isFocused ? '#C73E3A' : '#8E8781'} size={22} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setActionsVisible(true)}
        accessibilityLabel={t('actions.title')}
        className="h-14 w-14 items-center justify-center rounded-full bg-steel/80"
      >
        <Ellipsis color="#F5F1EC" size={22} />
      </Pressable>

      <ActionsSheet visible={actionsVisible} onClose={() => setActionsVisible(false)} />
    </View>
  );
}
