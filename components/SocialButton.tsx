import { ActivityIndicator, Pressable, Text } from 'react-native';

interface SocialButtonProps {
  label: string;
  loading?: boolean;
  onPress: () => void;
}

// 56px, surface #1E1B1A, texte bone-white — JAMAIS ember (UI prompt
// écran 3). Logo officiel monochrome Google pas encore disponible en
// asset local (jamais fabriqué à la place) — texte seul pour l'instant.
export function SocialButton({ label, loading, onPress }: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="h-14 w-full items-center justify-center rounded-2xl bg-input"
    >
      {loading ? <ActivityIndicator color="#F5F1EC" /> : <Text className="text-fg">{label}</Text>}
    </Pressable>
  );
}
