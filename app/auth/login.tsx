import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { AuthTextInput } from '../../components/AuthTextInput';
import { SocialButton } from '../../components/SocialButton';
import { mapAuthError } from '../../lib/auth-errors';
import { useAuthStore } from '../../lib/auth-store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await signInWithEmail(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(t(`auth.errors.${mapAuthError(signInError)}`));
      return;
    }
    router.replace('/(tabs)');
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: googleError, cancelled } = await signInWithGoogle();
    setGoogleLoading(false);

    if (cancelled) return;
    if (googleError) {
      setError(t(`auth.errors.${mapAuthError(googleError)}`));
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="gap-6 px-6 py-16">
      <Pressable onPress={() => router.back()}>
        <ChevronLeft color="#F5F1EC" size={28} />
      </Pressable>

      <View>
        <Text className="text-2xl text-fg">{t('auth.login.title')}</Text>
        <Text className="mt-1 text-muted">{t('auth.login.subtitle')}</Text>
      </View>

      <SocialButton label={t('auth.login.google')} loading={googleLoading} onPress={handleGoogle} />

      <Text className="text-center text-muted">{t('auth.login.divider')}</Text>

      <View className="gap-3">
        <AuthTextInput
          label={t('auth.login.email_label')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthTextInput
          label={t('auth.login.password_label')}
          value={password}
          onChangeText={setPassword}
          isPassword
        />
      </View>

      <Pressable onPress={() => router.push('/auth/forgot-password')}>
        <Text className="text-muted">{t('auth.login.forgot_password')}</Text>
      </Pressable>

      {error ? <Text className="text-fg">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="w-full items-center rounded-2xl bg-ember px-6 py-4"
      >
        <Text className="text-fg">{t('auth.login.cta')}</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/auth')}>
        <Text className="text-center text-muted">{t('auth.login.switch_to_signup')}</Text>
      </Pressable>
    </ScrollView>
  );
}
