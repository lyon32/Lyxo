import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getLastNDays, isSameDay, toDateKey } from '../lib/home-calendar';

interface StreakCalendarProps {
  // Jours avec une séance loggée — vide tant que Phase 2 (Logger) n'est pas
  // branché (ROADMAP.md Phase 2), voir LLD.md §6.2.
  activeDateKeys?: Set<string>;
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAYS_SHOWN = 14;

export function StreakCalendar({ activeDateKeys = new Set() }: StreakCalendarProps) {
  const { t } = useTranslation();
  const days = getLastNDays(DAYS_SHOWN);
  const today = new Date();

  const activeDaysCount = days.filter((day) => activeDateKeys.has(toDateKey(day))).length;
  const rangeLabel = `${days[0].toLocaleDateString(t('home.calendar.locale'), { month: 'short', day: 'numeric' })} - ${days[days.length - 1].toLocaleDateString(t('home.calendar.locale'), { month: 'short', day: 'numeric' })}`;

  // Aligne le 1er jour affiché sur un dimanche (colonne "sun") pour que la
  // grille ne décale pas les semaines — cases vides avant le vrai début.
  const leadingBlanks = days[0].getDay();
  const cells: (Date | null)[] = [...Array.from({ length: leadingBlanks }, () => null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View className="mt-6">
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="text-lg text-fg">{t('home.streak.title')}</Text>
          <Text className="text-sm text-muted">{rangeLabel}</Text>
        </View>
        <View className="items-end">
          <Text className="text-2xl text-fg">{activeDaysCount}</Text>
          <Text className="text-sm text-muted">{t('home.streak.active_days')}</Text>
        </View>
      </View>

      <View className="mb-2 flex-row">
        {WEEKDAY_KEYS.map((key) => (
          <Text key={key} className="flex-1 text-center text-xs text-muted">
            {t(`home.calendar.weekday_short_${key}`)}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="mb-2 flex-row gap-2">
          {week.map((day, dayIndex) => {
            if (!day) {
              return <View key={dayIndex} className="h-12 flex-1" />;
            }
            const isToday = isSameDay(day, today);
            const hasActivity = activeDateKeys.has(toDateKey(day));

            return (
              <View
                key={dayIndex}
                className={`h-12 flex-1 items-center justify-center rounded-xl border ${
                  hasActivity ? 'border-ember bg-ember' : isToday ? 'border-ember' : 'border-border'
                }`}
              >
                <Text className="text-fg">{day.getDate()}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
