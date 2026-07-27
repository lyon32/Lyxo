import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react-native';

import { EmptyState } from '../../components/EmptyState';
import { ExercisePicker } from '../../components/ExercisePicker';
import type { Exercise } from '../../lib/exercises-store';
import { goBackSafely } from '../../lib/safe-back';

interface SessionSet {
  id: string;
}

interface SessionExercise {
  id: string;
  exercise: Exercise;
  sets: SessionSet[];
}

let idCounter = 0;
const nextId = () => `s${(idCounter += 1)}`;

// Écran de séance active (LLD.md §6.5bis, ROADMAP 2.3) — "active" et non
// "[id]" parce qu'à ce stade il n'y a pas de persistance : une seule séance
// en cours possible, sans id. `app/workout/[id].tsx` viendra à côté pour les
// séances passées (§6.3) sans jamais entrer en collision.
//
// ⚠️ AUCUNE PERSISTANCE (ROADMAP 2.6). L'état vit dans l'écran et disparaît
// au kill de l'app — c'est attendu à ce stade, pas un bug.
// ⚠️ Pas de saisie poids/reps (ROADMAP 2.4, `WeightRepsInput`) : "+ Set"
// n'ajoute qu'une ligne de série numérotée, vide.
// ⚠️ L'action "Gym Check-in" de la référence est abandonnée (§6.5bis) — ne
// pas la réintroduire en la voyant dans les captures.
export default function ActiveWorkoutScreen() {
  const { t } = useTranslation();

  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftSelection, setDraftSelection] = useState<Exercise[]>([]);

  const totalSets = sessionExercises.reduce((sum, item) => sum + item.sets.length, 0);

  const toggleDraft = (exercise: Exercise) => {
    setDraftSelection((current) =>
      current.some((e) => e.id === exercise.id)
        ? current.filter((e) => e.id !== exercise.id)
        : [...current, exercise],
    );
  };

  const closePicker = () => {
    setPickerVisible(false);
    setDraftSelection([]);
  };

  // Sélection multiple : on ajoute les N exercices cochés en une passe
  // (§6.5bis #4). Un même exercice peut être ajouté plusieurs fois à une
  // séance (superset, reprise en fin de séance) — d'où un `id` d'instance
  // distinct de `exercise.id`.
  const confirmSelection = () => {
    setSessionExercises((current) => [
      ...current,
      ...draftSelection.map((exercise) => ({ id: nextId(), exercise, sets: [] })),
    ]);
    closePicker();
  };

  const addSet = (sessionExerciseId: string) => {
    setSessionExercises((current) =>
      current.map((item) =>
        item.id === sessionExerciseId ? { ...item, sets: [...item.sets, { id: nextId() }] } : item,
      ),
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl text-fg">{t('workout.active.title')}</Text>
          <Pressable onPress={() => goBackSafely('/(tabs)')} hitSlop={12}>
            <X color="#F5F1EC" size={24} />
          </Pressable>
        </View>

        <Text className="mb-6 text-muted">
          {t('workout.active.counter', { sets: totalSets, exercises: sessionExercises.length })}
        </Text>

        {sessionExercises.length === 0 ? (
          <EmptyState
            title={t('workout.active.empty_title')}
            description={t('workout.active.empty_description')}
          />
        ) : (
          <View className="gap-4">
            {sessionExercises.map((item) => (
              <ExerciseCard key={item.id} item={item} onAddSet={() => addSet(item.id)} />
            ))}
          </View>
        )}

        <Pressable
          onPress={() => setPickerVisible(true)}
          className="mt-6 min-h-tap flex-row items-center justify-center gap-2 rounded-2xl bg-ember px-6 py-4"
        >
          <Plus color="#F5F1EC" size={20} />
          <Text className="font-inter-semibold text-fg">{t('workout.active.add_exercise')}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={closePicker}>
        <View className="flex-1 bg-bg px-6 pt-16">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl text-fg">{t('workout.active.picker_title')}</Text>
            <Pressable onPress={closePicker} hitSlop={12}>
              <X color="#F5F1EC" size={24} />
            </Pressable>
          </View>

          <ExercisePicker
            selection={{ selectedIds: draftSelection.map((e) => e.id), onToggle: toggleDraft }}
          />

          {draftSelection.length > 0 ? (
            <Pressable
              onPress={confirmSelection}
              className="mb-8 min-h-tap items-center justify-center rounded-2xl bg-ember px-6 py-4"
            >
              <Text className="font-inter-semibold text-fg">
                {t('workout.active.add_selected', { count: draftSelection.length })}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function ExerciseCard({ item, onAddSet }: { item: SessionExercise; onAddSet: () => void }) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === 'en' ? item.exercise.name_en : item.exercise.name_fr;

  return (
    <View className="rounded-card border border-border bg-card p-4">
      <Text className="font-inter-semibold text-fg">{name}</Text>

      {item.sets.length === 0 ? (
        <Text className="mt-2 text-sm text-muted">{t('workout.active.no_sets')}</Text>
      ) : (
        <View className="mt-3 gap-2">
          {item.sets.map((set, index) => (
            // Ligne de série volontairement vide : la saisie poids/reps est
            // le composant `WeightRepsInput` de ROADMAP 2.4.
            <View
              key={set.id}
              className="flex-row items-center justify-between border-b border-border pb-2"
            >
              <Text className="text-muted">{t('workout.active.set_label', { index: index + 1 })}</Text>
              <Text className="text-muted">—</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pas d'icône Plus ici : le libellé porte déjà son "+" (§6.5bis, bouton
          "+ Set") — les deux ensemble affichaient un doublon "＋ + Série". */}
      <Pressable onPress={onAddSet} className="mt-3 min-h-tap justify-center py-2">
        <Text className="text-ember">{t('workout.active.add_set')}</Text>
      </Pressable>
    </View>
  );
}
