import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';

import { AuthTextInput } from '../../components/AuthTextInput';
import { useAuthStore } from '../../lib/auth-store';
import { supabase } from '../../lib/supabase';

// Écran 3quater (étape 3) — ouvert via le deep link de reset (lyxo://
// auth/reset-password?code=...). Production utilisera lyxo.app/reset/
// {token} en App Link vérifié une fois le web existant (Phase 3,
// PROJECT_BRIEF non-goal 6) — schéma custom lyxo:// en attendant.
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [status, setStatus] = useState<'checking' | 'ready' | 'expired'>('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const exchange = async (url: string | null) => {
      if (!url) {
        if (!cancelled) setStatus('expired');
        return;
      }
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
      if (!cancelled) setStatus(exchangeError ? 'expired' : 'ready');
    };

    Linking.getInitialURL().then(exchange);
    const subscription = Linking.addEventListener('url', ({ url }) => exchange(url));

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError(t('auth.errors.generic'));
      return;
    }
    router.replace('/(tabs)');
  };

  if (status === 'checking') {
    return <View className="flex-1 bg-bg" />;
  }

  if (status === 'expired') {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
        <Text className="text-fg">{t('auth.reset.expired')}</Text>
        <Pressable onPress={() => router.replace('/auth/forgot-password')}>
          <Text className="text-muted">{t('auth.reset.resend')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 gap-6 bg-bg px-6 py-16">
      <Text className="text-2xl text-fg">{t('auth.reset.title')}</Text>

      <View className="gap-1">
        <AuthTextInput
          label={t('auth.reset.password_label')}
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        <Text className="text-muted">{t('auth.reset.helper')}</Text>
      </View>

      {error ? <Text className="text-fg">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="w-full items-center rounded-2xl bg-ember px-6 py-4"
      >
        <Text className="text-fg">{t('auth.reset.cta')}</Text>
      </Pressable>
    </View>
  );
}
