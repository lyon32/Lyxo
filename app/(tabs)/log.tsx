import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseDetailModal } from '../../components/ExerciseDetailModal';
import { ExercisePicker } from '../../components/ExercisePicker';
import type { Exercise } from '../../lib/exercises-store';

// Onglet Log de la tab bar (LLD.md §6.1, révision 2026-07-24) — également
// atteignable via Actions → Exercises, même fichier/route : les deux chemins
// coexistent sans duplication de code.
//
// Tout le contenu (onglets All/Recent/Custom, recherche, chips, liste) vit
// dans `ExercisePicker`, partagé avec le sheet "Add Exercise" du flux de
// séance (§6.5bis). Ici, pas de `selection` => mode navigation : une ligne
// ouvre le détail de l'exercice au lieu de le cocher.
export default function LogScreen() {
  const { t } = useTranslation();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <Text className="mb-4 text-2xl text-fg">{t('exercises.header_title')}</Text>

      <ExercisePicker onPressExercise={setSelectedExercise} />

      <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </View>
  );
}
