import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';

import { supabase } from '../../lib/supabase';

// Filet de sécurité pour le retour OAuth (Google) : `WebBrowser.
// openAuthSessionAsync` (lib/auth-store.ts) est censé intercepter cette
// URL avant qu'elle n'atteigne la navigation de l'app, mais ce n'est pas
// fiable sur tous les Android/navigateurs — cet écran gère le cas où le
// deep link arrive ici directement. Les deux chemins peuvent tenter
// d'échanger le MÊME code PKCE (usage unique) : si celui-ci échoue ici
// parce que l'autre l'a déjà consommé avec succès, une session existe
// déjà — on vérifie ça avant de considérer que ça a vraiment échoué.
export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const [exchangeFailed, setExchangeFailed] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!params.code || params.error_description) return;

    let cancelled = false;

    const run = async () => {
      // Code brut, pas une URL reconstruite — évite tout parsing ambigu
      // d'un schéma custom (lyxo://) par l'implémentation URL de RN.
      const { error } = await supabase.auth.exchangeCodeForSession(params.code!);
      if (cancelled) return;

      if (!error) {
        router.replace('/(tabs)');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session) {
        router.replace('/(tabs)');
      } else {
        // Diagnostic temporaire — a retirer une fois le flow OAuth stabilise
        console.error('exchangeCodeForSession failed:', error);
        setDebugMessage(error.message);
        setExchangeFailed(true);
      }
    };

    run();

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
      {__DEV__ && (debugMessage || params.error_description) ? (
        <Text className="text-center text-muted">
          {debugMessage ?? params.error_description}
        </Text>
      ) : null}
      <Pressable onPress={() => router.replace('/auth/login')}>
        <Text className="text-muted">{t('auth.errors.back_to_login')}</Text>
      </Pressable>
    </View>
  );
}
