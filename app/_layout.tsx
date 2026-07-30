import '../global.css';
import '../lib/i18n';

import { useEffect } from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import i18next from 'i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as Notifications from 'expo-notifications';
import * as Sentry from '@sentry/react-native';

import { useAuthStore } from '../lib/auth-store';
import { getStoredLanguage } from '../lib/onboarding-storage';
import { initSentry } from '../lib/sentry';
import { startSupabaseAutoRefreshGating } from '../lib/supabase-auto-refresh';

initSentry();
SplashScreen.preventAutoHideAsync();

// Notification Handler global (PRD §1.2 & §1.4bis) : obligatoire pour qu'Android/iOS
// émettent le son et la vibration lorsque la notification de fin de repos se déclenche.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // `shouldShowAlert` est DÉPRÉCIÉ dans expo-notifications 57 et remplacé
    // par ce couple — tous deux REQUIS, d'où l'erreur de typage relevée le
    // 2026-07-28 ("missing shouldShowBanner, shouldShowList").
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    useAuthStore.getState().bootstrap();
    startSupabaseAutoRefreshGating();
  }, []);

  useEffect(() => {
    getStoredLanguage().then((language) => {
      if (language && language !== i18next.language) {
        // .changeLanguage() est une méthode d'instance i18next — faux positif connu (lib/i18n/index.ts)
        // eslint-disable-next-line import/no-named-as-default-member
        i18next.changeLanguage(language);
      }
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          {/* Route à plat : sans `app/workout/_layout.tsx`, expo-router nomme
              l'écran "workout/active" et non "workout". `app/workout/[id].tsx`
              (détail d'une séance passée, LLD §6.3) se déclarera pareil. */}
          <Stack.Screen name="workout/active" />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="messages" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
