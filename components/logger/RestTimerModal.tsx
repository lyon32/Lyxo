import { useEffect, useState } from 'react';
import { AppState, Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';

import { elapsedRatio, remainingSeconds } from '../../lib/rest-timer';
import { useRestTimerStore } from '../../lib/rest-timer-store';

const RING_SIZE = 260;
const RING_STROKE = 14;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Rafraîchissement de l'AFFICHAGE seulement. Le temps restant est toujours
// recalculé depuis `endsAt` : si Android suspend le JS, cet intervalle
// s'arrête sans conséquence, et l'affichage redevient juste au réveil.
const DISPLAY_TICK_MS = 250;

// Rest timer plein écran — PRD §1.2, LYXO_UI_PROMPT §6 (correctif #56).
export function RestTimerModal() {
  const { t } = useTranslation();
  const endsAt = useRestTimerStore((s) => s.endsAt);
  const totalDurationSecs = useRestTimerStore((s) => s.totalDurationSecs);
  const nextExerciseName = useRestTimerStore((s) => s.nextExerciseName);
  const nextSetTarget = useRestTimerStore((s) => s.nextSetTarget);
  const addSeconds = useRestTimerStore((s) => s.addSeconds);
  const stop = useRestTimerStore((s) => s.stop);
  const notificationsBlocked = useRestTimerStore((s) => s.notificationsBlocked);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;

    // `now` ne se réinitialise pas tout seul quand un NOUVEAU repos démarre :
    // ce composant est monté une fois pour toute l'app (racine du layout), et
    // sans cette ligne il garde la valeur d'un rendu passé (parfois très
    // ancien) jusqu'au premier tick de l'intervalle, jusqu'à 250 ms plus tard.
    // Résultat observé : le premier rendu affichait 90 s + tout le temps
    // écoulé depuis le montage — jamais le vrai 1:30.
    setNow(Date.now());

    const interval = setInterval(() => setNow(Date.now()), DISPLAY_TICK_MS);

    // Retour au premier plan : on resynchronise IMMÉDIATEMENT sans attendre le
    // prochain tick. C'est le cas d'usage majoritaire en salle — écran
    // verrouillé pendant le repos — et c'est ce qui rend le timestamp
    // indispensable : un `setInterval` seul aurait pris du retard.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        setNow(Date.now());
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [endsAt]);

  const remaining = remainingSeconds(endsAt, now);

  // Fermeture automatique quand le repos est écoulé — y compris s'il s'est
  // écoulé pendant la mise en veille.
  //
  // ⚠️ DANS UN EFFET, jamais pendant le rendu. Appeler `stop()` directement
  // dans le corps du composant est une mutation d'état en phase de rendu :
  // React la refuse ("Cannot update a component while rendering a different
  // component") et cela peut boucler, puisque chaque rendu redéclenche
  // l'écriture.
  useEffect(() => {
    if (endsAt !== null && remaining <= 0) {
      stop();
    }
  }, [endsAt, remaining, stop]);

  if (endsAt === null || remaining <= 0) return null;

  const ratio = elapsedRatio(endsAt, totalDurationSecs, now);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <Modal visible animationType="fade" onRequestClose={stop}>
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <View className="items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Anneau DERRIÈRE les chiffres, à 30 % d'opacité
              (LYXO_UI_PROMPT §6) — il se vide au fil du temps. */}
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={{ position: 'absolute', opacity: 0.3 }}
          >
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="#3A3F47"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="#C73E3A"
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * ratio}
              // Démarre à midi plutôt qu'à 3 h.
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>

          {/* Lisible à 2 mètres (LYXO_UI_PROMPT §6) : c'est un écran qu'on
              consulte posé au sol, entre deux séries. */}
          <Text className="font-inter-black text-6xl text-fg">
            {minutes}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>

        {/* Rappel doux quand le repos tourne sans sonnerie (PRD §1.4bis :
            "Refus = l'app fonctionne intégralement, avec un rappel doux").
            Sans cette ligne, l'absence de notification est indiscernable d'un
            bug — c'est exactement ce qui a coûté un diagnostic complet le
            2026-07-28, où la permission était refusée au niveau Android. */}
        {notificationsBlocked ? (
          <Text className="mt-6 text-center text-sm text-muted">
            {t('workout.rest.notifications_off')}
          </Text>
        ) : null}

        {nextExerciseName ? (
          <View className="mt-10 w-full rounded-card border border-border bg-card p-4">
            <Text className="text-sm text-muted">{t('workout.rest.next_up')}</Text>
            <Text className="mt-1 font-inter-semibold text-fg">{nextExerciseName}</Text>
            {nextSetTarget ? (
              <Text className="mt-1 text-muted">{nextSetTarget}</Text>
            ) : null}
          </View>
        ) : null}

        <View className="mt-10 w-full flex-row gap-3">
          <Pressable
            onPress={() => addSeconds(-15)}
            className="min-h-tap flex-1 items-center justify-center rounded-2xl bg-input"
          >
            <Text className="text-fg">{t('workout.rest.minus_15')}</Text>
          </Pressable>
          <Pressable
            onPress={() => addSeconds(15)}
            className="min-h-tap flex-1 items-center justify-center rounded-2xl bg-input"
          >
            <Text className="text-fg">{t('workout.rest.plus_15')}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={stop}
          className="mt-3 w-full min-h-tap items-center justify-center rounded-2xl bg-ember px-6"
        >
          <Text className="font-inter-semibold text-fg">{t('workout.rest.skip')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
