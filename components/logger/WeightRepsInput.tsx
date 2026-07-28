import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import {
  kgToLbs,
  lbsToKg,
  stepperIncrement,
  weightInputValue,
  type Locale,
  type WeightUnit,
} from '../../lib/units';

export type WeightRepsField = 'weight' | 'reps';

interface WeightRepsInputProps {
  weightKg: number;
  reps: number;
  unit: WeightUnit;
  locale: Locale;
  // Focus piloté par l'écran, pas par la ligne : plusieurs séries sont
  // affichées à la fois et une seule peut être en édition — sinon deux
  // claviers sticky coexisteraient. L'écran est le seul à pouvoir arbitrer.
  focusedField: WeightRepsField | null;
  // Tampon de frappe canonique (point décimal) du champ focus, ou null quand
  // la valeur affichée est la valeur formatée.
  editingValue: string | null;
  onFocusField: (field: WeightRepsField) => void;
  onChangeWeightKg: (weightKg: number) => void;
  onChangeReps: (reps: number) => void;
}

// Pixels de glissement pour un cran d'incrément.
const SWIPE_STEP_PX = 24;

// Les 2 blocs égaux du logger (LYXO_UI_PROMPT.md, LLD.md §6.5bis, audit 2.8).
// Poids et reps ont exactement le même poids visuel — aucun des deux n'est
// secondaire. Le bloc focus est souligné ember (discipline 1 accent).
//
// ⚠️ `weightKg` est la valeur CANONIQUE (§19.15) : la conversion vers l'unité
// d'affichage se fait ici, jamais dans le stockage.
export function WeightRepsInput({
  weightKg,
  reps,
  unit,
  locale,
  focusedField,
  editingValue,
  onFocusField,
  onChangeWeightKg,
  onChangeReps,
}: WeightRepsInputProps) {
  const { t } = useTranslation();
  const increments = stepperIncrement(unit);

  // L'incrément s'applique dans l'unité AFFICHÉE puis repasse en kg : en mode
  // lbs, "+2.5" doit ajouter 2,5 lbs, pas 2,5 kg.
  const stepWeight = (deltaInUnit: number) => {
    const currentInUnit = unit === 'kg' ? weightKg : kgToLbs(weightKg);
    const nextInUnit = Math.max(0, currentInUnit + deltaInUnit);
    onChangeWeightKg(unit === 'kg' ? nextInUnit : lbsToKg(nextInUnit));
  };

  const stepReps = (delta: number) => {
    onChangeReps(Math.max(0, reps + delta));
  };

  // Swipe haut/bas sur le bloc poids = ±1 cran, EN PLUS des steppers
  // (LYXO_UI_PROMPT). Vers le haut = plus lourd, geste naturel.
  const consumedTranslation = useSharedValue(0);
  const primaryIncrement = increments[0];

  const swipeWeight = Gesture.Pan()
    // ⚠️ Activation différée par un appui long (bug observé sur appareil le
    // 2026-07-27). Ce geste est un pan VERTICAL dans un ScrollView VERTICAL :
    // sans ce garde-fou, faire défiler la liste en passant le doigt sur le
    // bloc poids était interprété comme un swipe et décrémentait la charge de
    // 2,5 par 24 px, jusqu'à la ramener à 0. L'appui long rend le geste
    // délibéré et rend le défilement au ScrollView.
    .activateAfterLongPress(250)
    .onBegin(() => {
      consumedTranslation.value = 0;
    })
    .onUpdate((event) => {
      const pending = event.translationY - consumedTranslation.value;
      const steps = Math.trunc(pending / SWIPE_STEP_PX);
      if (steps === 0) return;
      consumedTranslation.value += steps * SWIPE_STEP_PX;
      // translationY est négatif vers le haut : on inverse pour que monter
      // augmente la charge.
      runOnJS(stepWeight)(-steps * primaryIncrement);
    });

  // ⚠️ Un tampon VIDE affiche la valeur réelle, surtout pas "0".
  //
  // Le tampon est vide au moment du focus (pour que la première frappe
  // remplace au lieu de s'ajouter). Afficher "0" à cet instant donnait
  // l'impression que toucher un bloc effaçait sa valeur — bug rapporté sur
  // appareil le 2026-07-27 : "je reviens sur l'exercice, le 10 repart à 0".
  // La donnée n'était jamais perdue, seul l'affichage mentait.
  const weightDisplay =
    focusedField === 'weight' && editingValue !== null && editingValue !== ''
      ? formatBuffer(editingValue, locale)
      : weightInputValue(weightKg, unit, locale);

  const repsDisplay =
    focusedField === 'reps' && editingValue !== null && editingValue !== ''
      ? editingValue
      : String(reps);

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <GestureDetector gesture={swipeWeight}>
          {/* flex-1 des deux côtés : blocs strictement égaux, jamais l'un
              plus large que l'autre. */}
          <View className="flex-1">
            <HeroBlock
              value={weightDisplay}
              suffix={unit}
              label={t('workout.input.weight_label')}
              focused={focusedField === 'weight'}
              onPress={() => onFocusField('weight')}
            />
          </View>
        </GestureDetector>

        <View className="flex-1">
          <HeroBlock
            value={repsDisplay}
            label={t('workout.input.reps_label')}
            focused={focusedField === 'reps'}
            onPress={() => onFocusField('reps')}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 flex-row flex-wrap gap-2">
          {/* Ordre miroir : les décréments décroissants à gauche, les
              incréments croissants à droite, comme une réglette. */}
          {[...increments].reverse().map((increment) => (
            <StepperButton
              key={`minus-${increment}`}
              label={`−${formatIncrement(increment, locale)}`}
              onPress={() => stepWeight(-increment)}
            />
          ))}
          {increments.map((increment) => (
            <StepperButton
              key={`plus-${increment}`}
              label={`+${formatIncrement(increment, locale)}`}
              onPress={() => stepWeight(increment)}
            />
          ))}
        </View>

        <View className="flex-1 flex-row gap-2">
          <StepperButton label="−1" onPress={() => stepReps(-1)} />
          <StepperButton label="+1" onPress={() => stepReps(1)} />
        </View>
      </View>
    </View>
  );
}

interface HeroBlockProps {
  value: string;
  label: string;
  focused: boolean;
  suffix?: string;
  onPress: () => void;
}

function HeroBlock({ value, label, focused, suffix, onPress }: HeroBlockProps) {
  return (
    <Pressable onPress={onPress} className="min-h-tap justify-center">
      <View className="flex-row items-baseline gap-1">
        {/* Valeur toujours plus grosse que son label (LYXO_UI_PROMPT) :
            36px Inter Black contre 14px pour le label. */}
        <Text className="font-inter-black text-4xl text-fg" numberOfLines={1}>
          {value}
        </Text>
        {suffix ? <Text className="text-base text-muted">{suffix}</Text> : null}
      </View>
      {/* 14px minimum sous un hero-number (correctif audit docs #13) — un
          label à 12px violait la règle "muted jamais < 14px". */}
      <Text className="mt-1 text-sm text-muted">{label}</Text>
      <View className={`mt-2 h-0.5 w-full ${focused ? 'bg-ember' : 'bg-border'}`} />
    </Pressable>
  );
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      // 56px minimum EN HAUTEUR ET EN LARGEUR (LYXO_UI_PROMPT STRICT RULES
      // #8) : le stepper est le geste le plus répété de l'app, il se rate au
      // pouce en salle. Volontairement PAS de `flex-1` — en mode lbs il y a
      // 4 boutons sur une demi-largeur, `flex-1` les écraserait sous 56px ;
      // à taille fixe ils passent proprement à la ligne.
      className="min-h-tap min-w-tap items-center justify-center rounded-2xl bg-input px-3"
    >
      <Text className="text-fg">{label}</Text>
    </Pressable>
  );
}

// Le tampon est canonique (point décimal) ; l'affichage suit la locale.
function formatBuffer(buffer: string, locale: Locale): string {
  return locale === 'fr' ? buffer.replace('.', ',') : buffer;
}

// "2,5" en fr, "2.5" en en — même règle que le reste des nombres.
function formatIncrement(increment: number, locale: Locale): string {
  const text = String(increment);
  return locale === 'fr' ? text.replace('.', ',') : text;
}
