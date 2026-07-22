import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { AuthTextInput } from '../../components/AuthTextInput';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { SocialButton } from '../../components/SocialButton';
import { mapAuthError } from '../../lib/auth-errors';
import { useAuthStore } from '../../lib/auth-store';
import { getOnboardingSplit, OnboardingSplit } from '../../lib/onboarding-storage';
import { useUsernameAvailability } from '../../lib/use-username-availability';

const SPLIT_LABEL_KEY: Record<OnboardingSplit, string> = {
  ppl: 'onboarding.split.ppl',
  upper_lower: 'onboarding.split.upper_lower',
  full_body: 'onboarding.split.full_body',
  custom: 'onboarding.split.full_body',
};

export default function SignupScreen() {
  const { t } = useTranslation();
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const [split, setSplit] = useState<OnboardingSplit | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const usernameCheck = useUsernameAvailability(username.toLowerCase());

  useEffect(() => {
    getOnboardingSplit().then(setSplit);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: signUpError, needsEmailConfirmation } = await signUpWithEmail(
      email.trim(),
      password,
      username.toLowerCase(),
    );
    setLoading(false);

    if (signUpError) {
      setError(t(`auth.errors.${mapAuthError(signUpError)}`));
      return;
    }
    if (needsEmailConfirmation) {
      setNeedsConfirmation(true);
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

  if (needsConfirmation) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-bg px-6">
        <Text className="text-center text-fg">{t('auth.forgot.success')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="gap-6 px-6 py-16">
      <OnboardingProgress current={3} />

      {split ? (
        <View className="w-full rounded-2xl border border-border bg-card p-6">
          <Text className="text-fg">✓ {t(SPLIT_LABEL_KEY[split])}</Text>
          <Text className="mt-1 text-muted">{t('auth.signup.recap_subtitle')}</Text>
        </View>
      ) : null}

      <SocialButton label={t('auth.signup.google')} loading={googleLoading} onPress={handleGoogle} />

      <Text className="text-center text-muted">{t('auth.signup.divider')}</Text>

      <View className="gap-3">
        <AuthTextInput
          label={t('auth.signup.username_label')}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {usernameCheck.status === 'taken' ? (
          <View>
            <Text className="text-fg">{t('auth.signup.username_taken')}</Text>
            {usernameCheck.suggestions.length > 0 ? (
              <Text className="text-muted">
                {t('auth.signup.username_suggestions_intro')} {usernameCheck.suggestions.join(', ')}
              </Text>
            ) : null}
          </View>
        ) : null}

        <AuthTextInput
          label={t('auth.signup.email_label')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthTextInput
          label={t('auth.signup.password_label')}
          value={password}
          onChangeText={setPassword}
          isPassword
        />
      </View>

      {error ? <Text className="text-fg">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="w-full items-center rounded-2xl bg-ember px-6 py-4"
      >
        <Text className="text-fg">{t('auth.signup.cta')}</Text>
      </Pressable>

      <Text className="text-center text-muted">
        {t('auth.signup.legal_prefix')}
        <Text onPress={() => Linking.openURL('https://lyxo.app/privacy')} className="underline">
          {t('auth.signup.legal_terms')}
        </Text>
        {t('auth.signup.legal_and')}
        <Text onPress={() => Linking.openURL('https://lyxo.app/privacy')} className="underline">
          {t('auth.signup.legal_privacy')}
        </Text>
      </Text>

      <Pressable onPress={() => router.push('/auth/login')}>
        <Text className="text-center text-muted">{t('auth.signup.switch_to_login')}</Text>
      </Pressable>
    </ScrollView>
  );
}
