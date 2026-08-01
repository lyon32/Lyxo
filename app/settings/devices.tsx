import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

import { EmptyState } from '../../components/EmptyState';
import { getOrCreateDeviceId } from '../../lib/device-id';
import {
  disconnectDevice,
  fetchDevices,
  relativeTimeFrom,
  type DeviceRecord,
} from '../../lib/devices';
import { goBackSafely } from '../../lib/safe-back';

// Écran "Mes appareils" — ROADMAP 3.6 révision 2026-08-01. La déconnexion
// d'un appareil est une action manuelle de gestion de session (type
// Netflix/Instagram), disponible pour tous les tiers — plus un levier de
// monétisation automatique (la contrainte "1 appareil si gratuit" a été
// supprimée).
export default function DevicesScreen() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DeviceRecord[] | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // `setDevices`/`setCurrentDeviceId` appelés depuis le `.then()` inline,
  // jamais depuis une fonction nommée invoquée directement dans l'effet
  // (react-hooks/set-state-in-effect) — même contournement que
  // `db/use-workout-summary.ts` : le fetch reste une fonction pure, seul le
  // callback de résolution touche l'état React.
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDevices(), getOrCreateDeviceId()]).then(([list, thisId]) => {
      if (cancelled) return;
      setDevices(list);
      setCurrentDeviceId(thisId);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDisconnect = (device: DeviceRecord) => {
    Alert.alert(
      t('settings.devices.disconnect_confirm_title'),
      t('settings.devices.disconnect_confirm_message'),
      [
        { text: t('settings.devices.disconnect_cancel'), style: 'cancel' },
        {
          text: t('settings.devices.disconnect_confirm_action'),
          style: 'destructive',
          onPress: async () => {
            setDisconnectingId(device.device_id);
            try {
              await disconnectDevice(device.device_id);
              setDevices((current) =>
                (current ?? []).map((d) =>
                  d.device_id === device.device_id ? { ...d, is_active: false } : d,
                ),
              );
            } catch {
              Alert.alert(t('settings.devices.disconnect_error'));
            } finally {
              setDisconnectingId(null);
            }
          },
        },
      ],
    );
  };

  const relativeLabel = (isoDate: string) => {
    const { unit, count } = relativeTimeFrom(isoDate);
    const value = unit === 'now' ? t('settings.devices.last_active_now') : t(`settings.devices.last_active_${unit}`, { count });
    return t('settings.devices.last_active_label', { value });
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <View className="mb-8 flex-row items-center gap-2">
        <Pressable onPress={() => goBackSafely('/(tabs)/profile')} hitSlop={12}>
          <ChevronLeft color="#F5F1EC" size={24} />
        </Pressable>
        <Text className="text-xl text-fg">{t('settings.devices.screen_title')}</Text>
      </View>

      {devices === null ? (
        <View className="py-8">
          <ActivityIndicator color="#C73E3A" />
        </View>
      ) : devices.length === 0 ? (
        <EmptyState
          title={t('settings.devices.empty_title')}
          description={t('settings.devices.empty_description')}
        />
      ) : (
        <ScrollView contentContainerClassName="gap-3 pb-8">
          {devices.map((device) => {
            const isCurrent = device.device_id === currentDeviceId;
            return (
              <View
                key={device.device_id}
                className={`rounded-card border border-border bg-card p-4 ${device.is_active ? '' : 'opacity-50'}`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-inter-semibold text-fg">
                    {device.device_name ?? t('settings.devices.unknown_device')}
                  </Text>
                  {isCurrent ? (
                    <View className="rounded-full bg-ember/20 px-3 py-1">
                      <Text className="font-inter-semibold text-xs uppercase text-ember">
                        {t('settings.devices.current_device_tag')}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text className="mt-1 text-sm text-muted">
                  {device.is_active
                    ? relativeLabel(device.last_active_at)
                    : t('settings.devices.disconnected_label')}
                </Text>

                {!isCurrent && device.is_active ? (
                  <Pressable
                    onPress={() => handleDisconnect(device)}
                    disabled={disconnectingId === device.device_id}
                    className="mt-3 min-h-tap items-center justify-center rounded-2xl border border-border"
                  >
                    <Text className="text-ember">{t('settings.devices.disconnect_button')}</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
