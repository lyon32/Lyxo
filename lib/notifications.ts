import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Sentry from '@sentry/react-native';

// Notifications locales — PRD §1.2 (rest timer background) et §1.4bis
// (permission runtime Android 13+).
//
// ⚠️ ZÉRO service background, ZÉRO consommation batterie (PRD §1.2) : on ne
// fait pas tourner de minuteur, on programme une notification à l'instant de
// fin et le système s'en occupe. Le compte à rebours affiché est recalculé
// depuis un timestamp, jamais entretenu par un `setInterval`.

export const REST_TIMER_CHANNEL_ID = 'rest-timer';

// Le canal Android porte l'importance, le son et la vibration. Sans canal
// explicite en importance HIGH, Android 8+ n'émet ni son ni vibration —
// exactement ce dont dépend l'usage en salle, écran verrouillé.
export async function configureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REST_TIMER_CHANNEL_ID, {
      name: 'Rest timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      // ⚠️ `sound` VOLONTAIREMENT OMIS. Sur un canal, le type est
      // `string | null` : toute chaîne y est interprétée comme un NOM DE
      // FICHIER audio à embarquer via le plugin `expo-notifications`. Passer
      // 'default' produisait donc l'erreur runtime observée le 2026-07-28 :
      // "Custom sound 'default' not found in native app".
      // Sans la propriété, Android applique le son de notification système,
      // ce qui est exactement l'attendu (PRD §1.2 : son/vibration app fermée).
      // Ne PAS y mettre `true` non plus : le booléen n'est accepté que dans
      // le `content` d'une notification, pas dans un canal.
    });
  } catch (error) {
    // Un canal absent dégrade la notification, il ne casse pas la séance :
    // le timer visuel continue de fonctionner.
    Sentry.captureException(error, { extra: { context: 'notification_channel' } });
  }
}

export type PermissionOutcome = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<PermissionOutcome> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  // `undetermined` = jamais demandé, donc le prompt système est encore
  // disponible. Un refus définitif (canAskAgain false) est un `denied` dont on
  // ne peut plus sortir depuis l'app.
  return status === 'undetermined' && canAskAgain ? 'undetermined' : 'denied';
}

// ⚠️ À n'appeler QU'APRÈS l'écran de priming interne (LLD §6.5bis).
// Android n'affiche le prompt système qu'UNE fois : le consommer sur un
// utilisateur non préparé, c'est un refus définitif sans recours in-app.
export async function requestNotificationPermission(): Promise<PermissionOutcome> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

// Programme la sonnerie de fin de repos. Retourne l'identifiant, nécessaire
// pour l'annuler si l'utilisateur passe le repos ou change la durée.
export async function scheduleRestTimerNotification(
  endsAtMs: number,
  title: string,
  body: string,
): Promise<string | null> {
  // Une date déjà passée ne serait jamais délivrée : inutile d'appeler l'API.
  if (endsAtMs <= Date.now()) return null;

  try {
    return await Notifications.scheduleNotificationAsync({
      // `sound: true` = sonnerie système. Une CHAÎNE ici désignerait un
      // fichier audio custom à déclarer dans le plugin `expo-notifications`,
      // qui n'existe pas dans ce projet.
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: endsAtMs,
        channelId: REST_TIMER_CHANNEL_ID,
      },
    });
  } catch (error) {
    // Permission refusée ou API indisponible : le timer visuel reste
    // utilisable, on perd seulement l'alerte écran verrouillé.
    Sentry.captureException(error, { extra: { context: 'schedule_rest_timer' } });
    return null;
  }
}

export async function cancelNotification(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    // Annuler une notification déjà délivrée ou inconnue n'est pas une
    // anomalie fonctionnelle — on ne veut pas casser le skip pour ça.
    Sentry.captureException(error, { extra: { context: 'cancel_rest_timer' } });
  }
}
