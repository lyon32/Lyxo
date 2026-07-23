import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';

import { supabase } from '../../lib/supabase';

// Filet de sécurité pour le retour OAuth (Google) : `WebBrowser.
// openAuthSessionAsync` (lib/auth-store.ts) est censé intercepter cette
// URL avant qu'elle n'atteigne la navigation de l'app, mais ce n'est pas
// fiable sur tous les Android/navigateurs — cet écran gère le cas où le
// deep link arrive ici directement (code déjà consommé par
// openAuthSessionAsync = no-op silencieux, exchangeCodeForSession
// échoue proprement dans ce cas).
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const [exchangeFailed, setExchangeFailed] = useState(false);

  useEffect(() => {
    if (!params.code || params.error_description) return;

    let cancelled = false;
    supabase.auth.exchangeCodeForSession(`lyxo://auth/callback?code=${params.code}`).then(
      ({ error }) => {
        if (cancelled) return;
        if (error) {
          setExchangeFailed(true);
          return;
        }
        router.replace('/(tabs)');
      },
    );

    return () => {
      cancelled = true;
    };
  }, [params.code, params.error_description]);

  const failed = exchangeFailed || !params.code || !!params.error_description;

  if (!failed) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <Text className="text-fg">{t('auth.errors.generic')}</Text>
      <Pressable onPress={() => router.replace('/auth/login')}>
        <Text className="text-muted">{t('auth.login.switch_to_signup')}</Text>
      </Pressable>
    </View>
  );
}
