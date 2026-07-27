import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
}

// Pattern d'état vide UNIQUE de l'app (LLD.md §6.0) : titre en gras +
// description en gris, alignés à GAUCHE, aucune illustration, aucune icône,
// aucun CTA décoratif. Une seule forme pour tous les cas (feed vide, aucune
// notif, onglets Recent/Custom du sheet Add Exercise, etc.).
//
// Un état vide est un écran de production, pas un trou : c'est exactement ce
// que voient les 10 coachs beta au premier lancement, avant d'avoir la
// moindre donnée. Jamais un `return null`, jamais un spinner infini, jamais
// un placeholder "à faire".
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="py-8">
      <Text className="font-inter-semibold text-xl text-fg">{title}</Text>
      {description ? <Text className="mt-2 text-muted">{description}</Text> : null}
    </View>
  );
}
