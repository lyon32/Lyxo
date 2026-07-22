import './global.css';
import './lib/i18n';

import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <View className="w-full rounded-2xl border border-border bg-card p-6">
        <Text className="text-fg">Palette Braise — écran de test</Text>
        <Text className="mt-1 text-muted">
          bg · card · border · muted · fg · ember · steel
        </Text>
      </View>
      <Pressable className="w-full items-center rounded-2xl bg-ember px-6 py-4">
        <Text className="text-fg">Commencer la séance</Text>
      </Pressable>
      <StatusBar style="light" />
    </View>
  );
}
