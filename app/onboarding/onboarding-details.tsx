import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { AuthTextInput } from '../../components/AuthTextInput';
import { CountryPickerModal } from '../../components/CountryPickerModal';
import { apiFetch } from '../../lib/api-client';
import { computeBillingRegion } from '../../lib/compute-billing-region';
import { CountryOption } from '../../lib/countries';
import { hasProblematicTerm, suggestNeutralPseudo } from '../../lib/pseudo-filter';
import { useUsernameAvailability } from '../../lib/use-username-availability';

type WeightUnit = 'kg' | 'lbs';

// Écran 2bis (LLD.md, ROADMAP 1.8) : après création du compte, avant
// l'Accueil. Aucune jauge de progression (décision fiche 18, LYXO_UI_
// PROMPT.md §2bis) — écran administratif court, pas une étape "de
// construction".
export default function OnboardingDetailsScreen() {
  const { t } = useTranslation();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [dataSaver, setDataSaver] = useState(false);
  const [showPseudoField, setShowPseudoField] = useState(false);
  const [pseudo, setPseudo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameCheck = useUsernameAvailability(showPseudoField ? pseudo.toLowerCase() : '');
  const problematic = showPseudoField && hasProblematicTerm(pseudo);
  const suggestions = problematic ? suggestNeutralPseudo(pseudo) : [];

  useEffect(() => {
    // Le champ pseudo ne réapparaît que pour les comptes OAuth qui n'ont
    // jamais eu l'écran 3 (fallback généré par handle_new_user, préfixe
    // "lyxo_" — supabase/migrations/20260722072825_create_profiles_
    // devices.sql). Un pseudo déjà saisi à l'écran 3 n'est pas redemandé
    // (LYXO_UI_PROMPT.md §2bis).
    apiFetch('/v1/profiles/me')
      .then((response) => response.json())
      .then((profile) => {
        const isFallback = typeof profile?.username === 'string' && profile.username.startsWith('lyxo_');
        setShowPseudoField(isFallback);
        if (isFallback) setPseudo('');
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSubmit = async () => {
    if (!country) {
      setError(t('onboarding.details.error_country_required'));
      return;
    }
    if (showPseudoField && usernameCheck.status === 'taken') {
      setError(t('onboarding.details.error_pseudo_taken'));
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const billingResponse = await computeBillingRegion(country.code);
      if (!billingResponse.ok) throw new Error('billing-region');

      const body: Record<string, unknown> = { weight_unit: unit, data_saver: dataSaver };
      if (showPseudoField && pseudo) body.username = pseudo.toLowerCase();

      const profileResponse = await apiFetch('/v1/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => null);
        setError(
          data?.error?.code === 'CONFLICT'
            ? t('onboarding.details.error_pseudo_taken')
            : t('onboarding.details.error_generic'),
        );
        setSubmitting(false);
        return;
      }

      router.replace('/(tabs)');
    } catch {
      setSubmitting(false);
      setError(t('onboarding.details.error_generic'));
    }
  };

  if (loadingProfile) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="gap-6 px-6 py-16">
      <View className="gap-1">
        <Text className="text-2xl text-fg">{t('onboarding.details.title')}</Text>
        <Text className="text-muted">{t('onboarding.details.subtitle')}</Text>
      </View>

      <View className="gap-3 rounded-2xl border border-border bg-card p-6">
        <Text className="text-muted">{t('onboarding.details.country_label')}</Text>
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="h-14 flex-row items-center rounded-2xl bg-input px-4"
        >
          <Text className={country ? 'text-fg' : 'text-muted'}>
            {country ? country.name : t('onboarding.details.country_placeholder')}
          </Text>
        </Pressable>

        <Text className="mt-2 text-muted">{t('onboarding.details.unit_label')}</Text>
        <View className="flex-row rounded-2xl bg-input p-1">
          <Pressable
            onPress={() => setUnit('kg')}
            className={`flex-1 items-center rounded-xl py-3 ${unit === 'kg' ? 'bg-steel' : ''}`}
          >
            <Text className="text-fg">{t('onboarding.details.unit_kg')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setUnit('lbs')}
            className={`flex-1 items-center rounded-xl py-3 ${unit === 'lbs' ? 'bg-steel' : ''}`}
          >
            <Text className="text-fg">{t('onboarding.details.unit_lbs')}</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <View className="flex-1 gap-1">
          <Text className="text-fg">{t('onboarding.details.data_saver_title')}</Text>
          <Text className="text-muted">{t('onboarding.details.data_saver_subtitle')}</Text>
        </View>
        <Switch
          value={dataSaver}
          onValueChange={setDataSaver}
          trackColor={{ false: '#3A3F47', true: '#C73E3A' }}
          thumbColor="#F5F1EC"
        />
      </View>

      <View className="rounded-2xl border border-border bg-card p-6">
        <Text className="text-center text-muted">{t('onboarding.details.history_rule')}</Text>
      </View>

      {showPseudoField ? (
        <View className="gap-2">
          <AuthTextInput
            label={t('onboarding.details.pseudo_label')}
            value={pseudo}
            onChangeText={setPseudo}
            autoCapitalize="none"
          />
          {usernameCheck.status === 'taken' ? (
            <Text className="text-muted">{t('auth.signup.username_taken')}</Text>
          ) : problematic ? (
            <Text className="text-muted">
              {t('onboarding.details.pseudo_hint_problematic')} {suggestions.join(', ')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {error ? <Text className="text-fg">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        className="w-full items-center rounded-2xl bg-ember px-6 py-4"
      >
        <Text className="text-fg">{t('onboarding.details.cta')}</Text>
      </Pressable>

      <CountryPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setCountry}
      />
    </ScrollView>
  );
}
