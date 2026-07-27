import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Bell, MessageCircle, X } from 'lucide-react-native';

import { HomeCalendarModal } from '../../components/HomeCalendarModal';
import { StreakCalendar } from '../../components/StreakCalendar';
import { getGreetingPeriod } from '../../lib/home-calendar';
import { getHomeTipDismissed, setHomeTipDismissed } from '../../lib/home-storage';
import { supabase } from '../../lib/supabase';

// Jours avec séance loggée : vide tant que Phase 2 (Logger, ROADMAP.md)
// n'est pas branché — StreakCalendar/HomeCalendarModal affichent 0 partout
// en attendant, par design (LLD.md §6.2).
const ACTIVE_DATE_KEYS = new Set<string>();

export default function HomeScreen() {
  const { t } = useTranslation();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [tipDismissed, setTipDismissed] = useState(true);
  const [avatarInitial, setAvatarInitial] = useState('?');

  useEffect(() => {
    getHomeTipDismissed().then((dismissed) => setTipDismissed(dismissed));
  }, []);

  useEffect(() => {
    // Avatars = INITIALES (jamais de photo/icône générique) — LYXO_UI_PROMPT.md
    // Design Style. Pas encore de store profil client — lecture directe du
    // user_metadata (posé au signup, lib/auth-store.ts) avec fallback email.
    supabase.auth.getUser().then(({ data }) => {
      const source = data.user?.user_metadata?.username ?? data.user?.email ?? '?';
      setAvatarInitial(source.charAt(0).toUpperCase());
    });
  }, []);

  const dismissTip = () => {
    setTipDismissed(true);
    setHomeTipDismissed();
  };

  const greeting = t(`home.greeting.${getGreetingPeriod()}`);

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-16">
        <View className="flex-row items-start justify-between">
          <Pressable
            onPress={() => setCalendarVisible(true)}
            className="flex-row items-center gap-1"
          >
            <Text className="text-3xl text-fg">{t('home.today_label')}</Text>
            <Text className="text-xl text-muted">▾</Text>
          </Pressable>

          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() => router.push('/notifications')}
              hitSlop={12}
              accessibilityLabel={t('notifications.header_title')}
            >
              <Bell color="#F5F1EC" size={24} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/messages')}
              hitSlop={12}
              accessibilityLabel={t('messages.header_title')}
            >
              <MessageCircle color="#F5F1EC" size={24} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/profile')}
              hitSlop={12}
              className="h-11 w-11 items-center justify-center rounded-full border border-steel bg-input"
              accessibilityLabel={t('nav.profile')}
            >
              <Text className="text-fg">{avatarInitial}</Text>
            </Pressable>
          </View>
        </View>
        <Text className="mt-1 text-muted">{greeting}</Text>

        {!tipDismissed ? (
          <View className="mt-6 flex-row items-center justify-between rounded-2xl border border-ember/25 bg-steel p-4">
            <Text className="flex-1 pr-4 text-fg">{t('home.tip_text')}</Text>
            <Pressable onPress={dismissTip} hitSlop={12}>
              <X color="#8E8781" size={18} />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push('/workout/active')}
          className="mt-6 flex-row items-center justify-between rounded-2xl border border-ember/25 bg-steel p-6"
        >
          <View className="flex-1 pr-4">
            <Text className="text-xl text-fg">{t('home.cta_title')}</Text>
            <Text className="mt-1 text-muted">{t('home.cta_subtitle')}</Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full bg-ember">
            <ArrowUpRight color="#F5F1EC" size={24} />
          </View>
        </Pressable>

        <StreakCalendar activeDateKeys={ACTIVE_DATE_KEYS} />
      </View>

      <HomeCalendarModal
        visible={calendarVisible}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onClose={() => setCalendarVisible(false)}
        activeDateKeys={ACTIVE_DATE_KEYS}
      />
    </ScrollView>
  );
}
