import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Flag, Plus, X } from 'lucide-react-native';

import { EmptyState } from '../../components/EmptyState';
import { ExercisePicker } from '../../components/ExercisePicker';
import { NotificationPrimingModal } from '../../components/NotificationPrimingModal';
import { NumberKeyboard } from '../../components/logger/NumberKeyboard';
import { PRCelebrationModal } from '../../components/logger/PRCelebrationModal';
import { RestTimerModal } from '../../components/logger/RestTimerModal';
import { WeightRepsInput, type WeightRepsField } from '../../components/logger/WeightRepsInput';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../../lib/notifications';
import { useRestTimerStore } from '../../lib/rest-timer-store';
import {
  currentProfileId,
  getSetSnapshot,
  useActiveWorkout,
  type ActiveExerciseView,
  type ActiveSetView,
} from '../../db/use-active-workout';
import { recordSetPRs, type CelebratedPR } from '../../db/pr-recording';
import { type Exercise, useExercisesStore } from '../../lib/exercises-store';
import { goBackSafely } from '../../lib/safe-back';
import { formatWeight, lbsToKg, type Locale, type WeightUnit } from '../../lib/units';

interface EditingTarget {
  setId: string;
  field: WeightRepsField;
}

// Marge laissée au-dessus de la ligne amenée à l'écran, pour que le libellé
// "Série N" reste lisible et qu'elle ne colle pas au bord.
const SCROLL_TOP_MARGIN = 24;

// ⚠️ PROVISOIRE (ROADMAP 2.4) : `profiles.weight_unit` est écrit à
// l'onboarding mais jamais relu côté app — aucun store ne l'expose. Le
// composant et `lib/units.ts` sont réellement unit-aware et testés sur les
// deux unités ; seule cette constante est figée. À remplacer par la
// préférence du profil dès qu'un store la porte.
const DISPLAY_UNIT: WeightUnit = 'kg';

// Durée de repos par défaut. Non configurable à ce stade : le réglage par
// exercice n'est pas spécifié dans la ROADMAP Phase 2.
const REST_DEFAULT_SECS = 90;

// Écran de séance active (LLD.md §6.5bis, ROADMAP 2.3-2.6) — "active" et non
// "[id]" parce qu'une seule séance peut être ouverte à la fois : celle dont
// `completed_at` est null. `app/workout/[id].tsx` viendra à côté pour les
// séances passées (§6.3) sans jamais entrer en collision.
//
// Depuis 2.6 la séance est PERSISTÉE dans WatermelonDB : elle survit au kill
// de l'app. Seul le tampon de frappe du clavier reste en mémoire.
// ⚠️ L'action "Gym Check-in" de la référence est abandonnée (§6.5bis) — ne
// pas la réintroduire en la voyant dans les captures.
export default function ActiveWorkoutScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language === 'en' ? 'en' : 'fr';

  const { view, ready, error, addExercises, addSet, updateSet, finishWorkout } = useActiveWorkout();
  const router = useRouter();

  // Le référentiel d'exercices vit dans un store réseau, pas en base locale :
  // après un kill de l'app on rouvre cet écran sans être passé par le sheet,
  // donc c'est ici aussi qu'il faut le charger pour retrouver les noms.
  const exercises = useExercisesStore((s) => s.exercises);
  const loadExercises = useExercisesStore((s) => s.load);
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftSelection, setDraftSelection] = useState<Exercise[]>([]);

  // Le focus vit ICI et pas dans la ligne : plusieurs séries sont affichées à
  // la fois, une seule peut être en édition, et il ne doit exister qu'un seul
  // clavier sticky à l'écran.
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [buffer, setBuffer] = useState<string | null>(null);

  const startRest = useRestTimerStore((s) => s.start);
  const [primingVisible, setPrimingVisible] = useState(false);
  // Le repos à démarrer une fois que l'utilisateur a répondu au priming.
  const pendingRestRef = useRef<{ exerciseName: string } | null>(null);

  // Célébration PR (ROADMAP 2.10) : quand une série valide un ou plusieurs
  // records, le repos est différé jusqu'à la fermeture de cet écran — sinon
  // les deux plein-écran se disputeraient l'affichage.
  const [celebration, setCelebration] = useState<{
    exerciseName: string;
    prs: CelebratedPR[];
  } | null>(null);
  const pendingRestAfterCelebrationRef = useRef<{ exerciseName: string } | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const setRowRefs = useRef(new Map<string, View>());
  const scrollOffset = useRef(0);
  const viewportHeight = useRef(0);

  const registerSetRow = useCallback((setId: string, node: View | null) => {
    if (node) {
      setRowRefs.current.set(setId, node);
    } else {
      setRowRefs.current.delete(setId);
    }
  }, []);

  const editingSetId = editing?.setId ?? null;

  // Défilement automatique vers la série en cours d'édition : le clavier
  // occupe le bas de l'écran, une série choisie en bas de liste se
  // retrouverait cachée derrière lui.
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
  // séance (superset, reprise en fin de séance) — chaque ligne
  // `workout_exercises` est une instance distincte.
  const confirmSelection = async () => {
    await addExercises(draftSelection.map((exercise) => exercise.id));
    closePicker();
  };

  // Le tampon de frappe ne descend PAS en base à chaque touche (motif du
  // tableau LLD §4) : il est validé ici, au moment où l'utilisateur ferme le
  // clavier ou passe à un autre champ.
  const commitBuffer = useCallback(async () => {
    if (!editing || buffer === null) return;
    // ⚠️ Un tampon VIDE veut dire "rien n'a été saisi", pas "zéro". Le tampon
    // est initialisé à '' au focus : le traiter comme 0 écrasait la valeur
    // existante dès qu'on touchait un bloc puis qu'on en sortait sans taper
    // (bug observé sur appareil le 2026-07-27 : "55 repasse à 0").
    if (buffer === '') return;
    const parsed = Number.parseFloat(buffer);
    if (Number.isNaN(parsed)) return;

    if (editing.field === 'weight') {
      // La saisie est dans l'unité AFFICHÉE et repasse en kg avant d'être
      // stockée (§19.15).
      await updateSet(editing.setId, {
        weightKg: DISPLAY_UNIT === 'kg' ? parsed : lbsToKg(parsed),
      });
    } else {
      await updateSet(editing.setId, { reps: Math.round(parsed) });
    }
  }, [editing, buffer, updateSet]);

  const focusField = async (setId: string, field: WeightRepsField) => {
    // Passer d'un champ à l'autre vaut validation : sinon la valeur tapée
    // disparaîtrait sans prévenir.
    await commitBuffer();
    setEditing({ setId, field });
    // Tampon vide : la première frappe remplace la valeur au lieu de s'y
    // ajouter — le geste attendu quand on tape sur un nombre pour le corriger.
    setBuffer('');
  };

  const closeKeyboard = async () => {
    await commitBuffer();
    setEditing(null);
    setBuffer(null);
  };

  // Les steppers écrivent une valeur DÉJÀ validée : ils vont directement en
  // base, et effacent le tampon pour que le bloc réaffiche la valeur réelle.
  const stepSet = async (setId: string, patch: { weightKg?: number; reps?: number }) => {
    setBuffer(null);
    await updateSet(setId, patch);
  };

  // Démarrage effectif du repos, factorisé : appelé directement quand aucun
  // PR n'a été détecté, ou après la fermeture de la célébration PR sinon.
  const startRestFlow = async (next: { exerciseName: string }) => {
    // Le prompt système Android n'existe qu'une fois : on passe d'abord par
    // l'écran de priming interne (LLD §6.5bis). Le contrôle est local et
    // instantané, il ne retarde pas la séance de façon perceptible.
    const permission = await getNotificationPermission();
    if (permission === 'undetermined') {
      pendingRestRef.current = next;
      setPrimingVisible(true);
      return;
    }
    await startRest(REST_DEFAULT_SECS, next);
  };

  // Validation d'une série : elle est marquée faite, un PR éventuel est
  // détecté et enregistré (ROADMAP 2.9/2.10), puis le repos démarre (PRD
  // §1.2) — après la célébration s'il y en a une, pour ne pas superposer
  // deux plein-écran.
  const validateSet = async (
    setId: string,
    exerciseId: string | null,
    exerciseName: string,
  ) => {
    await commitBuffer();
    setEditing(null);
    setBuffer(null);

    await updateSet(setId, { isCompleted: true });

    // Lu directement en base APRÈS l'écriture, jamais depuis `view` : le
    // state React de ce rendu est une closure périmée qui ne reflète pas le
    // `commitBuffer`/`updateSet` qu'on vient d'attendre (bug constaté sur
    // appareil le 2026-07-30 — voir `getSetSnapshot`).
    const setSnapshot = await getSetSnapshot(setId);

    const next = { exerciseName };

    if (exerciseId && setSnapshot) {
      const profileId = await currentProfileId();
      if (profileId) {
        const prs = await recordSetPRs({
          profileId,
          exerciseId,
          setId,
          weightKg: setSnapshot.weightKg,
          reps: setSnapshot.reps,
        });
        if (prs.length > 0) {
          setCelebration({ exerciseName, prs });
          pendingRestAfterCelebrationRef.current = next;
          return;
        }
      }
    }

    await startRestFlow(next);
  };

  const handleEnableNotifications = async () => {
    setPrimingVisible(false);
    await requestNotificationPermission();
    // Le repos démarre quel que soit le verdict : un refus ne doit rien
    // empêcher (PRD §1.4bis, "l'app fonctionne intégralement").
    const pending = pendingRestRef.current;
    pendingRestRef.current = null;
    await startRest(REST_DEFAULT_SECS, pending ?? undefined);
  };

  const handleDismissPriming = async () => {
    setPrimingVisible(false);
    const pending = pendingRestRef.current;
    pendingRestRef.current = null;
    // "Plus tard" ne consomme pas le prompt système : on pourra redemander au
    // repos suivant.
    await startRest(REST_DEFAULT_SECS, pending ?? undefined);
  };

  // "Partager en story" : LYXO n'a pas encore d'écran Stories (composer/feed
  // social — Phase 4+, LLD.md components/social/). En attendant, la feuille
  // de partage native du téléphone reste un CTA fonctionnel dès aujourd'hui.
  const handleShareCelebration = async () => {
    if (!celebration) return;
    const eligible = celebration.prs.find((pr) => pr.isSocialEligible) ?? celebration.prs[0];
    try {
      await Share.share({
        message: t('workout.pr.share_message', {
          exerciseName: celebration.exerciseName,
          value:
            eligible.type === 'reps'
              ? `${eligible.value}`
              : formatWeight(eligible.value, DISPLAY_UNIT, locale),
        }),
      });
    } catch {
      // Feuille de partage annulée ou indisponible : rien à faire, l'écran
      // reste ouvert pour laisser "Continuer" comme sortie normale.
    }
  };

  const handleDismissCelebration = async () => {
    setCelebration(null);
    const pending = pendingRestAfterCelebrationRef.current;
    pendingRestAfterCelebrationRef.current = null;
    if (pending) {
      await startRestFlow(pending);
    }
  };

  // Termine la séance (ROADMAP 2.11) : marque `completed_at`, fige le volume
  // total, puis bascule sur le résumé peak-end — jamais retour en arrière
  // possible vers une séance déjà terminée, d'où `replace` et non `push`.
  const handleFinishWorkout = async () => {
    const workoutId = await finishWorkout();
    if (workoutId) {
      router.replace({ pathname: '/workout/summary', params: { id: workoutId } });
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
              sets: t('workout.active.counter_sets', { count: view?.totalSets ?? 0 }),
              exercises: t('workout.active.counter_exercises', {
                count: view?.exercises.length ?? 0,
              }),
            })}
          </Text>

          {/* Une écriture qui échoue doit se voir ICI, pas seulement dans
              Sentry : sans ça un tap sans effet est indiscernable d'un bug
              d'interface, et intestable en support. */}
          {error !== null ? (
            <View className="mb-4 rounded-card border border-ember bg-card p-4">
              <Text className="font-inter-semibold text-fg">
                {t('workout.active.write_error_title')}
              </Text>
              <Text className="mt-1 text-sm text-muted">{error}</Text>
            </View>
          ) : null}

          {!ready ? (
            <View className="py-8">
              <ActivityIndicator color="#C73E3A" />
            </View>
          ) : !view || view.exercises.length === 0 ? (
            <EmptyState
              title={t('workout.active.empty_title')}
              description={t('workout.active.empty_description')}
            />
          ) : (
            <View className="gap-4">
              {view.exercises.map((item) => (
                <ExerciseCard
                  key={item.id}
                  item={item}
                  exercise={item.exerciseId ? exercisesById.get(item.exerciseId) : undefined}
                  locale={locale}
                  editing={editing}
                  buffer={buffer}
                  registerSetRow={registerSetRow}
                  onAddSet={() => addSet(item.id)}
                  onFocusField={focusField}
                  onStepSet={stepSet}
                  onValidateSet={(setId) => {
                    const foundExercise = item.exerciseId
                      ? exercisesById.get(item.exerciseId)
                      : undefined;
                    const exerciseName = foundExercise
                      ? i18n.language === 'en'
                        ? foundExercise.name_en
                        : foundExercise.name_fr
                      : '';
                    validateSet(setId, item.exerciseId, exerciseName);
                  }}
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

          {view && view.exercises.length > 0 ? (
            <Pressable
              onPress={handleFinishWorkout}
              className="mt-3 min-h-tap flex-row items-center justify-center gap-2 rounded-2xl border border-border py-4"
            >
              <Flag color="#F5F1EC" size={18} />
              <Text className="font-inter-semibold text-fg">
                {t('workout.active.finish_workout')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Clavier sticky : hors du ScrollView, il occupe le bas de l'écran et
          rétrécit la zone défilable au lieu de la recouvrir. */}
      {editing !== null ? (
        <NumberKeyboard
          value={buffer ?? ''}
          locale={locale}
          allowDecimal={editing.field === 'weight'}
          onChange={setBuffer}
          onDone={closeKeyboard}
        />
      ) : null}

      {/* Rest timer plein écran : il se monte tout seul dès qu'un `endsAt`
          existe dans le store, y compris après un kill de l'app si le repos
          court toujours (état persisté en AsyncStorage). */}
      <RestTimerModal />

      {/* Le repos ne démarre pas tant que cette carte est ouverte
          (`handleDismissCelebration` s'en charge) : deux plein-écran ne se
          superposent jamais. */}
      {celebration ? (
        <PRCelebrationModal
          exerciseName={celebration.exerciseName}
          prs={celebration.prs}
          unit={DISPLAY_UNIT}
          locale={locale}
          onShare={handleShareCelebration}
          onDismiss={handleDismissCelebration}
        />
      ) : null}

      <NotificationPrimingModal
        visible={primingVisible}
        onEnable={handleEnableNotifications}
        onDismiss={handleDismissPriming}
      />

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
  item: ActiveExerciseView;
  exercise: Exercise | undefined;
  locale: Locale;
  editing: EditingTarget | null;
  buffer: string | null;
  registerSetRow: (setId: string, node: View | null) => void;
  onAddSet: () => void;
  onFocusField: (setId: string, field: WeightRepsField) => void;
  onStepSet: (setId: string, patch: { weightKg?: number; reps?: number }) => void;
  onValidateSet: (setId: string) => void;
}

function ExerciseCard({
  item,
  exercise,
  locale,
  editing,
  buffer,
  registerSetRow,
  onAddSet,
  onFocusField,
  onStepSet,
  onValidateSet,
}: ExerciseCardProps) {
  const { t, i18n } = useTranslation();
  // Le référentiel arrive du réseau : tant qu'il n'est pas chargé (ou hors
  // ligne au premier lancement), on garde la ligne plutôt que de la masquer.
  const name = exercise
    ? i18n.language === 'en'
      ? exercise.name_en
      : exercise.name_fr
    : t('workout.active.exercise_unavailable');

  return (
    <View className="rounded-card border border-border bg-card p-4">
      <Text className="font-inter-semibold text-fg">{name}</Text>

      {item.sets.length === 0 ? (
        <Text className="mt-2 text-sm text-muted">{t('workout.active.no_sets')}</Text>
      ) : (
        <View className="mt-3 gap-5">
          {item.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              locale={locale}
              editing={editing}
              buffer={buffer}
              registerSetRow={registerSetRow}
              onFocusField={onFocusField}
              onStepSet={onStepSet}
              onValidateSet={onValidateSet}
            />
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

interface SetRowProps {
  set: ActiveSetView;
  locale: Locale;
  editing: EditingTarget | null;
  buffer: string | null;
  registerSetRow: (setId: string, node: View | null) => void;
  onFocusField: (setId: string, field: WeightRepsField) => void;
  onStepSet: (setId: string, patch: { weightKg?: number; reps?: number }) => void;
  onValidateSet: (setId: string) => void;
}

function SetRow({
  set,
  locale,
  editing,
  buffer,
  registerSetRow,
  onFocusField,
  onStepSet,
  onValidateSet,
}: SetRowProps) {
  const { t } = useTranslation();

  return (
    <View
      // `collapsable={false}` : sans ça Android peut fusionner cette vue avec
      // son parent, et la référence utilisée pour la mesure ne pointerait
      // plus sur rien.
      collapsable={false}
      ref={(node) => registerSetRow(set.id, node)}
      className="gap-2 border-b border-border pb-4"
    >
      <Text className="text-sm text-muted">
        {t('workout.active.set_label', { index: set.setNumber })}
      </Text>
      <WeightRepsInput
        weightKg={set.weightKg}
        reps={set.reps}
        unit={DISPLAY_UNIT}
        locale={locale}
        focusedField={editing?.setId === set.id ? editing.field : null}
        editingValue={editing?.setId === set.id ? buffer : null}
        onFocusField={(field) => onFocusField(set.id, field)}
        onChangeWeightKg={(weightKg) => onStepSet(set.id, { weightKg })}
        onChangeReps={(reps) => onStepSet(set.id, { reps })}
      />

      {/* Valider la serie marque la serie faite ET demarre le repos
          (PRD §1.2). Une fois validee, le bouton reste affiche pour montrer
          l'etat mais ne relance plus rien : reappuyer ne doit pas redemarrer
          un repos pour une serie deja terminee. */}
      <Pressable
        onPress={() => {
          if (set.isCompleted) return;
          onValidateSet(set.id);
        }}
        disabled={set.isCompleted}
        className={`mt-2 min-h-tap items-center justify-center rounded-2xl ${
          set.isCompleted ? 'border border-border bg-card' : 'bg-steel'
        }`}
      >
        <Text className={set.isCompleted ? 'text-muted' : 'font-inter-semibold text-fg'}>
          {t(set.isCompleted ? 'workout.active.set_done' : 'workout.active.validate_set')}
        </Text>
      </Pressable>
    </View>
  );
}
