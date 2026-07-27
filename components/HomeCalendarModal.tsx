import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { getMonthGrid, isSameDay, toDateKey } from '../lib/home-calendar';

interface HomeCalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  // Jours avec une séance loggée — vide tant que Phase 2 (Logger) n'est pas
  // branché (ROADMAP.md Phase 2), voir LLD.md §6.2.
  activeDateKeys?: Set<string>;
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export function HomeCalendarModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  activeDateKeys = new Set(),
}: HomeCalendarModalProps) {
  const { t } = useTranslation();
  const [viewedMonth, setViewedMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const weeks = getMonthGrid(viewedMonth.getFullYear(), viewedMonth.getMonth());
  const monthLabel = viewedMonth.toLocaleDateString(t('home.calendar.locale'), {
    month: 'long',
    year: 'numeric',
  });
  const today = new Date();

  const goToMonth = (delta: number) => {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="absolute bottom-0 w-full rounded-t-3xl bg-card px-6 pb-10 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-lg text-fg" style={{ textTransform: 'capitalize' }}>
            {monthLabel}
          </Text>
          <View className="flex-row gap-4">
            <Pressable onPress={() => goToMonth(-1)} hitSlop={12}>
              <ChevronLeft color="#8E8781" size={22} />
            </Pressable>
            <Pressable onPress={() => goToMonth(1)} hitSlop={12}>
              <ChevronRight color="#8E8781" size={22} />
            </Pressable>
          </View>
        </View>

        <View className="mb-2 flex-row">
          {WEEKDAY_KEYS.map((key) => (
            <Text key={key} className="flex-1 text-center text-xs text-muted">
              {t(`home.calendar.weekday_${key}`)}
            </Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="mb-2 flex-row">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={dayIndex} className="h-12 flex-1" />;
              }
              const selected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);
              const hasActivity = activeDateKeys.has(toDateKey(day));

              return (
                <Pressable
                  key={dayIndex}
                  onPress={() => onSelectDate(day)}
                  className="h-12 flex-1 items-center justify-center"
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      selected ? 'bg-ember' : ''
                    } ${!selected && isToday ? 'border border-ember' : ''}`}
                  >
                    <Text className={selected ? 'text-fg' : 'text-fg'}>{day.getDate()}</Text>
                  </View>
                  <View className={`mt-0.5 h-1 w-1 rounded-full ${hasActivity ? 'bg-ember' : ''}`} />
                </Pressable>
              );
            })}
          </View>
        ))}

        <Pressable
          onPress={onClose}
          className="mt-4 min-h-tap items-center justify-center rounded-2xl bg-ember"
        >
          <Text className="text-fg">{t('home.calendar.done')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
