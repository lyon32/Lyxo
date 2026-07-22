import { Pressable, Text, View } from 'react-native';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

// Data-card générique (Objectif/Split, UI prompt) — sélection = fin
// liseré ember en pied de carte, jamais de fond ember plein (réservé CTA).
export function SelectableCard({ title, subtitle, selected, onPress }: SelectableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full rounded-2xl border bg-card p-6 ${
        selected ? 'border-border border-b-2 border-b-ember' : 'border-border'
      }`}
    >
      <View className="gap-1">
        <Text className="text-lg text-fg">{title}</Text>
        {subtitle ? <Text className="text-muted">{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}
