import '../global.css';
import '../lib/i18n';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import i18next from 'i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getStoredLanguage } from '../lib/onboarding-storage';
import { initSentry } from '../lib/sentry';

initSentry();

export default function RootLayout() {
  useEffect(() => {
    getStoredLanguage().then((language) => {
      if (language && language !== i18next.language) {
        // .changeLanguage() est une méthode d'instance i18next — faux positif connu (lib/i18n/index.ts)
        // eslint-disable-next-line import/no-named-as-default-member
        i18next.changeLanguage(language);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
