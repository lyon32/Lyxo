import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  cancelNotification,
  configureNotificationChannel,
  scheduleRestTimerNotification,
} from './notifications';
import { clampedEndsAt } from './rest-timer';

// Rest timer — PRD §1.2, LYXO_UI_PROMPT §6 (correctif #56).
//
// ⚠️ AUCUN `setInterval` NE PORTE L'ÉTAT. Android suspend le JS dès que
// l'écran se verrouille — cas MAJORITAIRE en salle. Le timer est donc défini
// par un unique `endsAt` (epoch ms) persisté : le compte à rebours et l'anneau
// se RECALCULENT depuis lui à chaque rendu et à chaque retour au premier plan.
// Un intervalle ne sert qu'à rafraîchir l'affichage, jamais à décompter.

export interface RestTimerState {
  endsAt: number | null;
  totalDurationSecs: number;
  notificationId: string | null;
  nextExerciseName: string | null;
  nextSetTarget: string | null;
  // Vrai quand le repos tourne SANS notification programmee (permission
  // refusee). Rend visible un etat autrement silencieux — PRD §1.4bis
  // prevoit "un rappel doux" plutot qu'un echec muet.
  notificationsBlocked: boolean;
  start: (durationSecs: number, next?: { exerciseName?: string; setTarget?: string }) => Promise<void>;
  addSeconds: (deltaSecs: number) => Promise<void>;
  stop: () => Promise<void>;
}

export const useRestTimerStore = create<RestTimerState>()(
  persist(
    (set, get) => ({
      endsAt: null,
      totalDurationSecs: 0,
      notificationId: null,
      nextExerciseName: null,
      nextSetTarget: null,
      notificationsBlocked: false,

      start: async (durationSecs, next) => {
        const current = get();
        // IDEMPOTENCE (Point 2) : seul un double-appel pour LE MÊME repos
        // (même durée cible, même exercice suivant) ne doit pas réinitialiser
        // le décompte. Comparer seulement `endsAt > Date.now()` bloquait à
        // tort tout nouveau repos tant qu'un timer non expiré traînait en
        // mémoire persistée (ex. resté d'une session précédente tuée en plein
        // repos) : le nouveau repos ne démarrait jamais, l'écran affichait la
        // durée de l'ancien jusqu'à son expiration naturelle.
        const isSameRest =
          current.endsAt !== null &&
          current.endsAt > Date.now() &&
          current.totalDurationSecs === durationSecs &&
          current.nextExerciseName === (next?.exerciseName ?? null);
        if (isSameRest) {
          return;
        }

        // Un timer déjà en cours est remplacé : sa notification doit être
        // annulée, sinon elle sonnerait pour un repos qui n'existe plus.
        await cancelNotification(current.notificationId);
        await configureNotificationChannel();

        const endsAt = Date.now() + durationSecs * 1000;
        set({
          endsAt,
          totalDurationSecs: durationSecs,
          notificationId: null,
          nextExerciseName: next?.exerciseName ?? null,
          nextSetTarget: next?.setTarget ?? null,
        });

        const notificationId = await scheduleRestTimerNotification(
          endsAt,
          'Repos terminé',
          next?.exerciseName ? `Prochaine série : ${next.exerciseName}` : 'Prochaine série',
        );
        // L'état a pu changer pendant l'await (skip très rapide) : on ne
        // rattache l'id que si ce timer est toujours celui en cours.
        if (get().endsAt === endsAt) {
          // `null` = la programmation a echoue, quasi toujours faute de
          // permission. Le repos reste utilisable, mais l'utilisateur doit
          // savoir qu'il ne sonnera pas ecran verrouille.
          set({ notificationId, notificationsBlocked: notificationId === null });
        } else {
          await cancelNotification(notificationId);
        }
      },

      addSeconds: async (deltaSecs) => {
        const { endsAt, totalDurationSecs, notificationId, nextExerciseName } = get();
        if (endsAt === null) return;

        const now = Date.now();
        const nextEndsAt = clampedEndsAt(endsAt, deltaSecs, now);

        // La notification est reprogrammée, pas décalée : l'API ne sait pas
        // modifier une notification déjà planifiée.
        await cancelNotification(notificationId);
        set({
          endsAt: nextEndsAt,
          // La durée totale suit, sinon l'anneau afficherait une progression
          // incohérente après un ±15 s.
          totalDurationSecs: Math.max(1, totalDurationSecs + deltaSecs),
          notificationId: null,
        });

        const newId = await scheduleRestTimerNotification(
          nextEndsAt,
          'Repos terminé',
          nextExerciseName ? `Prochaine série : ${nextExerciseName}` : 'Prochaine série',
        );
        if (get().endsAt === nextEndsAt) {
          set({ notificationId: newId });
        } else {
          await cancelNotification(newId);
        }
      },

      stop: async () => {
        await cancelNotification(get().notificationId);
        set({
          endsAt: null,
          totalDurationSecs: 0,
          notificationId: null,
          nextExerciseName: null,
          nextSetTarget: null,
          notificationsBlocked: false,
        });
      },
    }),
    {
      name: 'lyxo-rest-timer',
      storage: createJSONStorage(() => AsyncStorage),
      // Seul l'état, jamais les actions.
      partialize: (state) => ({
        endsAt: state.endsAt,
        totalDurationSecs: state.totalDurationSecs,
        notificationId: state.notificationId,
        nextExerciseName: state.nextExerciseName,
        nextSetTarget: state.nextSetTarget,
      }),
      // Au retour d'un kill de l'app, un repos déjà écoulé ne doit pas
      // réapparaître à l'écran : la notification a fait son office.
      onRehydrateStorage: () => (state) => {
        if (state?.endsAt !== null && state?.endsAt !== undefined && state.endsAt <= Date.now()) {
          useRestTimerStore.setState({
            endsAt: null,
            totalDurationSecs: 0,
            notificationId: null,
            nextExerciseName: null,
            nextSetTarget: null,
          });
        }
      },
    },
  ),
);
