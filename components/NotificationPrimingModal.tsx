import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BellRing } from 'lucide-react-native';

interface NotificationPrimingModalProps {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

// Écran de priming AVANT le prompt système (LLD.md §6.5bis, PRD §1.4bis).
//
// ⚠️ RAISON D'ÊTRE : Android n'affiche le prompt `POST_NOTIFICATIONS` qu'UNE
// SEULE FOIS. Le consommer sur un utilisateur qui ne comprend pas pourquoi on
// le sollicite, c'est un refus définitif sans recours depuis l'app. Un "Plus
// tard" ici ne consomme rien : on pourra redemander au repos suivant.
//
// Pas d'avatars ni de visages (LYXO_UI_PROMPT : "NO human faces anywhere", et
// aucune image générée par IA) — une icône de cloche et du texte suffisent.
export function NotificationPrimingModal({
  visible,
  onEnable,
  onDismiss,
}: NotificationPrimingModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View className="flex-1 justify-end bg-bg/80">
        <View className="rounded-t-card border-t border-border bg-card px-6 pb-10 pt-8">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-ember/15">
            <BellRing color="#C73E3A" size={26} />
          </View>

          <Text className="font-inter-semibold text-2xl text-fg">
            {t('notifications.priming.title')}
          </Text>
          <Text className="mt-2 text-muted">{t('notifications.priming.description')}</Text>

          <Pressable
            onPress={onEnable}
            className="mt-6 min-h-tap items-center justify-center rounded-2xl bg-ember px-6"
          >
            <Text className="font-inter-semibold text-fg">
              {t('notifications.priming.enable')}
            </Text>
          </Pressable>

          {/* "Plus tard" est un vrai choix, pas un piège : il ne déclenche
              aucun appel système, donc rien n'est perdu. */}
          <Pressable
            onPress={onDismiss}
            className="mt-2 min-h-tap items-center justify-center rounded-2xl px-6"
          >
            <Text className="text-muted">{t('notifications.priming.later')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
