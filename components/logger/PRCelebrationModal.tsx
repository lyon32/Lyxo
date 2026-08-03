import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { CelebratedPR } from '../../db/pr-recording';
import { prDeltaLabel } from '../../lib/pr-display';
import { formatWeight, type Locale, type WeightUnit } from '../../lib/units';

// Célébration PR — LYXO_UI_PROMPT §7, ROADMAP 2.10. "the shareable PR card
// AS the visual" : pas de confetti, pas de photo (audit design 1.6/§18) —
// la carte EST l'écran. Ember badge, chiffre en Inter Black 64px, delta en
// ember, wordmark LYXO.
//
// ⚠️ Emplacement : LLD.md §1 place la carte dans `components/ui/PRCard.tsx`,
// mais ce dossier `ui/` n'existe pas encore dans ce projet (structure plate
// assumée jusqu'ici, ex. `RestTimerModal.tsx` à côté). Rangé dans
// `components/logger/` avec le reste de l'écran de séance plutôt que de
// créer un dossier design-system pour un seul fichier.

interface PRCelebrationModalProps {
  exerciseName: string;
  prs: CelebratedPR[];
  unit: WeightUnit;
  locale: Locale;
  onShare: () => void;
  onDismiss: () => void;
}

function primaryValueLabel(pr: CelebratedPR, unit: WeightUnit, locale: Locale, t: (key: string) => string) {
  switch (pr.type) {
    case 'weight':
      return formatWeight(pr.value, unit, locale);
    case '1rm':
      return formatWeight(pr.value, unit, locale);
    case 'volume':
      return formatWeight(pr.value, unit, locale);
    case 'reps':
      return `${pr.value}`;
  }
}

function badgeKey(type: CelebratedPR['type']): string {
  return `workout.pr.badge_${type}`;
}

// `deltaLabel` vivait ici en privé, donc couverte par aucun test. Déplacée
// dans `lib/pr-display.ts` (`prDeltaLabel`) le 2026-08-03 : le bloc Records
// du résumé affiche désormais le même delta, et deux implémentations
// divergeraient tôt ou tard sur ce que vaut une progression.

// Une carte par type de PR battu — un même set peut en battre plusieurs
// (ex: poids max ET 1RM estimé).
//
// ⚠️ N'EST PLUS UTILISÉE PAR LE RÉSUMÉ DE FIN DE SÉANCE depuis le
// 2026-08-03 (`components/workout/PRSummaryBlock.tsx`). Cette carte est
// désormais réservée à la MODALE de célébration, qui est le moment "peak" :
// déclenchée depuis UN exercice, dont le contexte est donc implicite. C'est
// ce qui rend acceptable le `showExerciseAsTitle` ci-dessous, qui n'affiche
// le nom de l'exercice que pour un record de poids : sur le résumé, qui
// agrège plusieurs exercices, cette omission était une perte d'information.
// Ne pas réutiliser ce composant sur un écran qui agrège plusieurs exercices
// sans lever cette restriction.
export function PRCard({
  exerciseName,
  pr,
  unit,
  locale,
}: {
  exerciseName: string;
  pr: CelebratedPR;
  unit: WeightUnit;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const delta = prDeltaLabel(pr, unit, locale);
  const showExerciseAsTitle = pr.type === 'weight';

  return (
    <View className="w-full rounded-card border border-border bg-card p-6">
      <View className="self-start rounded-full bg-ember/20 px-3 py-1">
        <Text className="font-inter-semibold text-xs uppercase text-ember">
          {t(badgeKey(pr.type))}
        </Text>
      </View>

      <Text className="mt-4 text-sm text-muted">
        {showExerciseAsTitle ? exerciseName : t(`workout.pr.label_${pr.type}`)}
      </Text>
      <View className="mt-1 flex-row items-baseline gap-2">
        <Text className="font-inter-black text-6xl text-fg">
          {primaryValueLabel(pr, unit, locale, t)}
        </Text>
        {delta ? <Text className="font-inter-semibold text-lg text-ember">{delta}</Text> : null}
      </View>

      {!pr.isSocialEligible ? (
        <Text className="mt-3 text-xs text-muted">{t('workout.pr.private_only')}</Text>
      ) : null}
    </View>
  );
}

export function PRCelebrationModal({
  exerciseName,
  prs,
  unit,
  locale,
  onShare,
  onDismiss,
}: PRCelebrationModalProps) {
  const { t } = useTranslation();
  if (prs.length === 0) return null;

  const anyEligible = prs.some((pr) => pr.isSocialEligible);

  return (
    <Modal visible animationType="fade" onRequestClose={onDismiss}>
      <View className="flex-1 bg-bg px-6 pb-8 pt-16">
        <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
          {prs.map((pr) => (
            <PRCard key={pr.type} exerciseName={exerciseName} pr={pr} unit={unit} locale={locale} />
          ))}
        </ScrollView>

        <View className="mt-6 w-full gap-3">
          {anyEligible ? (
            <Pressable
              onPress={onShare}
              className="min-h-tap w-full items-center justify-center rounded-2xl bg-ember px-6"
            >
              <Text className="font-inter-semibold text-fg">{t('workout.pr.share_story')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onDismiss}
            className="min-h-tap w-full items-center justify-center rounded-2xl bg-input"
          >
            <Text className="text-fg">{t('workout.pr.continue')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
