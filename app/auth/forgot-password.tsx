import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

import { AuthTextInput } from '../../components/AuthTextInput';
import { mapAuthError } from '../../lib/auth-errors';
import { useAuthStore } from '../../lib/auth-store';
import { goBackSafely } from '../../lib/safe-back';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setLoading(false);

    if (resetError) {
      setError(t(`auth.errors.${mapAuthError(resetError)}`));
      return;
    }
    setSent(true);
  };

  return (
    <View className="flex-1 gap-6 bg-bg px-6 py-16">
      <Pressable onPress={() => goBackSafely('/auth/login')}>
        <ChevronLeft color="#F5F1EC" size={28} />
      </Pressable>

      <Text className="text-2xl text-fg">{t('auth.forgot.title')}</Text>

      {sent ? (
        <Text className="text-fg">{t('auth.forgot.success')}</Text>
      ) : (
        <>
          <AuthTextInput
            label={t('auth.forgot.email_label')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {error ? <Text className="text-fg">{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="w-full items-center rounded-2xl bg-ember px-6 py-4"
          >
            <Text className="text-fg">{t('auth.forgot.cta')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
