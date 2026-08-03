import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PRCard } from '../../components/logger/PRCelebrationModal';
import { useWorkoutSummary } from '../../db/use-workout-summary';
import { useExercisesStore } from '../../lib/exercises-store';
import { formatWeight, type Locale, type WeightUnit } from '../../lib/units';
import { dayLabel, formatDurationLabel, volumeDeltaKg } from '../../lib/workout-summary';

// Résumé de fin de séance — LYXO_UI_PROMPT §5bis (peak-end, "the dopamine
// screen"), ROADMAP 2.11. "Transporter, pas informer" : un seul sens de
// scroll, zéro carte imbriquée.
//
// ⚠️ Décision explicite (2026-07-30) : la version RICHE de LYXO_UI_PROMPT
// est construite ici plutôt que la version "minimale" que LLD.md §6.5bis
// décrivait comme un choix délibéré — LLD a été corrigé en conséquence pour
// ne plus se contredire avec ce fichier.
//
// ⚠️ Hors périmètre, documenté plutôt que deviné :
// - L'animation "week-strip check pops in" (Home) n'est pas déclenchée
//   depuis cet écran : `StreakCalendar` sur Home n'est pas encore branché
//   à de vraies données (`ACTIVE_DATE_KEYS` est un placeholder statique,
//   voir `app/(tabs)/index.tsx`) — un chantier Home à part entière.
// - Le delta affiché compare au volume de la séance TERMINÉE précédente,
//   pas à "la même séance" : ROADMAP 2.7 (Templates/Splits) a été
//   abandonnée, il n'existe plus de notion de séance nommée à comparer.
const DISPLAY_UNIT: WeightUnit = 'kg';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language === 'en' ? 'en' : 'fr';
  const router = useRouter();

  // ⚠️ `summary` est RÉACTIF depuis le 2026-08-01 : une sync qui écrit dans
  // `workouts`/`workout_exercises`/`sets`/`personal_records` produit un nouvel
  // objet, même à valeurs identiques. Ne jamais brancher un `useEffect` sur
  // `summary` (confettis, haptique, analytics "résumé vu") — il se
  // redéclencherait à chaque émission de sync. Ces effets se posent au montage
  // ou sur une valeur primitive stable, pas sur l'objet.
  const { summary, ready } = useWorkoutSummary(id ?? null);
  const exercises = useExercisesStore((s) => s.exercises);
  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const handleFinish = () => router.replace('/(tabs)');

  const handleShare = async () => {
    if (!summary) return;
    try {
      await Share.share({
        message: t('workout.summary.share_message', {
          volume: formatWeight(summary.totalVolumeKg, DISPLAY_UNIT, locale),
          dayLabel: dayLabel(summary.completedAt, locale),
        }),
      });
    } catch {
      // Feuille de partage annulée : "Terminer" reste la sortie normale.
    }
  };

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#C73E3A" />
      </View>
    );
  }

  if (!summary) {
    // Séance introuvable ou pas encore terminée (ex. lien direct sans avoir
    // fini) : rien à résumer, retour direct plutôt qu'un écran cassé.
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Pressable
          onPress={handleFinish}
          className="min-h-tap items-center justify-center rounded-2xl bg-ember px-6 py-4"
        >
          <Text className="font-inter-semibold text-fg">{t('workout.summary.finish')}</Text>
        </Pressable>
      </View>
    );
  }

  const delta = volumeDeltaKg(summary.totalVolumeKg, summary.previousVolumeKg);

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="grow items-center justify-center gap-4 px-6 py-16"
    >
      <Text className="text-lg text-muted">{dayLabel(summary.completedAt, locale)}</Text>

      <View className="items-center">
        <Text className="font-inter-black text-6xl text-fg">
          {formatWeight(summary.totalVolumeKg, DISPLAY_UNIT, locale)}
        </Text>
        {delta !== null ? (
          <Text className="mt-1 font-inter-semibold text-lg text-ember">
            {delta >= 0 ? '+' : ''}
            {formatWeight(delta, DISPLAY_UNIT, locale)}
          </Text>
        ) : null}
      </View>

      <View className="mt-6 w-full flex-row justify-around rounded-card border border-border bg-card p-4">
        <View className="items-center">
          <Text className="font-inter-semibold text-fg">
            {formatDurationLabel(summary.durationMs)}
          </Text>
          <Text className="text-xs text-muted">{t('workout.summary.stat_duration')}</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-semibold text-fg">{summary.setsCount}</Text>
          <Text className="text-xs text-muted">{t('workout.summary.stat_sets')}</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-semibold text-fg">{summary.exercisesCount}</Text>
          <Text className="text-xs text-muted">{t('workout.summary.stat_exercises')}</Text>
        </View>
      </View>

      {summary.prs.length > 0 ? (
        <View className="mt-6 w-full gap-4">
          {summary.prs.map((pr, index) => (
            <PRCard
              // Une même séance peut battre le même type sur deux exercices
              // différents : la clé combine les deux plutôt que le seul type.
              key={`${pr.exerciseId}-${pr.type}-${index}`}
              exerciseName={
                exercisesById.get(pr.exerciseId)?.[i18n.language === 'en' ? 'name_en' : 'name_fr'] ??
                ''
              }
              pr={pr}
              unit={DISPLAY_UNIT}
              locale={locale}
            />
          ))}
        </View>
      ) : null}

      <View className="mt-8 w-full gap-3">
        <Pressable
          onPress={handleShare}
          className="min-h-tap w-full items-center justify-center rounded-2xl bg-ember px-6"
        >
          <Text className="font-inter-semibold text-fg">{t('workout.pr.share_story')}</Text>
        </Pressable>
        <Pressable
          onPress={handleFinish}
          className="min-h-tap w-full items-center justify-center rounded-2xl bg-input"
        >
          <Text className="text-fg">{t('workout.summary.finish')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
