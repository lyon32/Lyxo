import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react-native';

import { EmptyState } from '../../components/EmptyState';
import { ExercisePicker } from '../../components/ExercisePicker';
import { NumberKeyboard } from '../../components/logger/NumberKeyboard';
import { WeightRepsInput, type WeightRepsField } from '../../components/logger/WeightRepsInput';
import type { Exercise } from '../../lib/exercises-store';
import { goBackSafely } from '../../lib/safe-back';
import { lbsToKg, type Locale, type WeightUnit } from '../../lib/units';

interface SessionSet {
  id: string;
  // Valeur CANONIQUE en kg (§19.15) — l'unité d'affichage n'existe qu'à
  // l'écran, jamais dans la donnée.
  weightKg: number;
  reps: number;
}

interface SessionExercise {
  id: string;
  exercise: Exercise;
  sets: SessionSet[];
}

interface EditingTarget {
  setId: string;
  field: WeightRepsField;
}

let idCounter = 0;
const nextId = () => `s${(idCounter += 1)}`;

// Marge laissée au-dessus de la ligne amenée à l'écran, pour que le libellé
// "Série N" reste lisible et qu'elle ne colle pas au bord.
const SCROLL_TOP_MARGIN = 24;

// ⚠️ PROVISOIRE (ROADMAP 2.4) : `profiles.weight_unit` est écrit à
// l'onboarding mais jamais relu côté app — aucun store ne l'expose. Le
// composant et `lib/units.ts` sont réellement unit-aware et testés sur les
// deux unités ; seule cette constante est figée. À remplacer par la
// préférence du profil dès qu'un store la porte.
const DISPLAY_UNIT: WeightUnit = 'kg';

// Écran de séance active (LLD.md §6.5bis, ROADMAP 2.3-2.4) — "active" et non
// "[id]" parce qu'à ce stade il n'y a pas de persistance : une seule séance
// en cours possible, sans id. `app/workout/[id].tsx` viendra à côté pour les
// séances passées (§6.3) sans jamais entrer en collision.
//
// ⚠️ AUCUNE PERSISTANCE (ROADMAP 2.6). L'état vit dans l'écran et disparaît
// au kill de l'app — c'est attendu à ce stade, pas un bug.
// ⚠️ L'action "Gym Check-in" de la référence est abandonnée (§6.5bis) — ne
// pas la réintroduire en la voyant dans les captures.
export default function ActiveWorkoutScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language === 'en' ? 'en' : 'fr';

  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftSelection, setDraftSelection] = useState<Exercise[]>([]);

  // Le focus vit ICI et pas dans la ligne : plusieurs séries sont affichées à
  // la fois, une seule peut être en édition, et il ne doit exister qu'un seul
  // clavier sticky à l'écran.
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [buffer, setBuffer] = useState<string | null>(null);

  // Défilement automatique vers la série en cours d'édition : le clavier
  // occupe le bas de l'écran, une série choisie en bas de liste se
  // retrouverait cachée derrière lui.
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const setRowRefs = useRef(new Map<string, View>());
  const scrollOffset = useRef(0);
  const viewportHeight = useRef(0);

  const totalSets = sessionExercises.reduce((sum, item) => sum + item.sets.length, 0);

  const registerSetRow = useCallback((setId: string, node: View | null) => {
    if (node) {
      setRowRefs.current.set(setId, node);
    } else {
      setRowRefs.current.delete(setId);
    }
  }, []);

  const editingSetId = editing?.setId ?? null;

  useEffect(() => {
    if (editingSetId === null) return;

    // Une frame d'attente : le clavier vient de se monter et le ScrollView
    // rétrécit dans le même commit — mesurer trop tôt donnerait la hauteur
    // de viewport d'AVANT le clavier, donc un défilement insuffisant.
    const frame = requestAnimationFrame(() => {
      const row = setRowRefs.current.get(editingSetId);
      const content = contentRef.current;
      const scroll = scrollRef.current;
      if (!row || !content || !scroll) return;

      row.measureLayout(
        content,
        (_x, rowY, _width, rowHeight) => {
          const visibleTop = scrollOffset.current;
          const visibleBottom = visibleTop + viewportHeight.current;
          const fullyVisible = rowY >= visibleTop && rowY + rowHeight <= visibleBottom;
          // Ne bouger que si nécessaire : défiler une ligne déjà lisible
          // serait sa propre gêne.
          if (fullyVisible) return;
          scroll.scrollTo({ y: Math.max(0, rowY - SCROLL_TOP_MARGIN), animated: true });
        },
        () => {},
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [editingSetId]);

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
        item.id === sessionExerciseId
          ? { ...item, sets: [...item.sets, { id: nextId(), weightKg: 0, reps: 0 }] }
          : item,
      ),
    );
  };

  const updateSet = (setId: string, patch: Partial<SessionSet>) => {
    setSessionExercises((current) =>
      current.map((item) => ({
        ...item,
        sets: item.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
      })),
    );
  };

  const focusField = (setId: string, field: WeightRepsField) => {
    setEditing({ setId, field });
    // Tampon vide : la première frappe remplace la valeur au lieu de s'y
    // ajouter — le geste attendu quand on tape sur un nombre pour le corriger.
    setBuffer('');
  };

  const closeKeyboard = () => {
    setEditing(null);
    setBuffer(null);
  };

  // Le tampon est canonique (point décimal) ; la valeur saisie est dans
  // l'unité AFFICHÉE et repasse en kg avant d'être stockée (§19.15).
  const applyBuffer = (next: string) => {
    setBuffer(next);
    if (!editing) return;

    const parsed = next === '' ? 0 : Number.parseFloat(next);
    if (Number.isNaN(parsed)) return;

    if (editing.field === 'weight') {
      updateSet(editing.setId, {
        weightKg: DISPLAY_UNIT === 'kg' ? parsed : lbsToKg(parsed),
      });
    } else {
      updateSet(editing.setId, { reps: Math.round(parsed) });
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="px-6 pb-8 pt-16"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
        }}
        onLayout={(event) => {
          // Se remesure tout seul quand le clavier apparaît et rétrécit le
          // ScrollView — c'est cette hauteur-là qui dit ce qui est visible.
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
      >
        {/* Repère de mesure : `measureLayout` a besoin d'un ancêtre stable
            pour donner une position dans le CONTENU et non dans l'écran.
            `collapsable={false}` empêche Android de supprimer cette vue. */}
        <View ref={contentRef} collapsable={false}>
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl text-fg">{t('workout.active.title')}</Text>
            <Pressable onPress={() => goBackSafely('/(tabs)')} hitSlop={12}>
              <X color="#F5F1EC" size={24} />
            </Pressable>
          </View>

          {/* Deux quantités pluralisées séparément puis recomposées : i18next
              ne pluralise qu'une variable `count` par clé, et "1 séries" est
              une faute visible en permanence en tête d'écran. */}
          <Text className="mb-6 text-muted">
            {t('workout.active.counter', {
              sets: t('workout.active.counter_sets', { count: totalSets }),
              exercises: t('workout.active.counter_exercises', {
                count: sessionExercises.length,
              }),
            })}
          </Text>

          {sessionExercises.length === 0 ? (
            <EmptyState
              title={t('workout.active.empty_title')}
              description={t('workout.active.empty_description')}
            />
          ) : (
            <View className="gap-4">
              {sessionExercises.map((item) => (
                <ExerciseCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  editing={editing}
                  buffer={buffer}
                  registerSetRow={registerSetRow}
                  onAddSet={() => addSet(item.id)}
                  onFocusField={focusField}
                  onChangeWeightKg={(setId, weightKg) => updateSet(setId, { weightKg })}
                  onChangeReps={(setId, reps) => updateSet(setId, { reps })}
                />
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
        </View>
      </ScrollView>

      {/* Clavier sticky : hors du ScrollView, il occupe le bas de l'écran et
          rétrécit la zone défilable au lieu de la recouvrir. */}
      {editing !== null ? (
        <NumberKeyboard
          value={buffer ?? ''}
          locale={locale}
          allowDecimal={editing.field === 'weight'}
          onChange={applyBuffer}
          onDone={closeKeyboard}
        />
      ) : null}

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

interface ExerciseCardProps {
  item: SessionExercise;
  locale: Locale;
  editing: EditingTarget | null;
  buffer: string | null;
  registerSetRow: (setId: string, node: View | null) => void;
  onAddSet: () => void;
  onFocusField: (setId: string, field: WeightRepsField) => void;
  onChangeWeightKg: (setId: string, weightKg: number) => void;
  onChangeReps: (setId: string, reps: number) => void;
}

function ExerciseCard({
  item,
  locale,
  editing,
  buffer,
  registerSetRow,
  onAddSet,
  onFocusField,
  onChangeWeightKg,
  onChangeReps,
}: ExerciseCardProps) {
  const { t, i18n } = useTranslation();
  const name = i18n.language === 'en' ? item.exercise.name_en : item.exercise.name_fr;

  return (
    <View className="rounded-card border border-border bg-card p-4">
      <Text className="font-inter-semibold text-fg">{name}</Text>

      {item.sets.length === 0 ? (
        <Text className="mt-2 text-sm text-muted">{t('workout.active.no_sets')}</Text>
      ) : (
        <View className="mt-3 gap-5">
          {item.sets.map((set, index) => (
            <View
              key={set.id}
              // `collapsable={false}` : sans ça Android peut fusionner cette
              // vue avec son parent, et la référence utilisée pour la mesure
              // ne pointerait plus sur rien.
              collapsable={false}
              ref={(node) => registerSetRow(set.id, node)}
              className="gap-2 border-b border-border pb-4"
            >
              <Text className="text-sm text-muted">
                {t('workout.active.set_label', { index: index + 1 })}
              </Text>
              <WeightRepsInput
                weightKg={set.weightKg}
                reps={set.reps}
                unit={DISPLAY_UNIT}
                locale={locale}
                focusedField={editing?.setId === set.id ? editing.field : null}
                editingValue={editing?.setId === set.id ? buffer : null}
                onFocusField={(field) => onFocusField(set.id, field)}
                onChangeWeightKg={(weightKg) => onChangeWeightKg(set.id, weightKg)}
                onChangeReps={(reps) => onChangeReps(set.id, reps)}
              />
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
