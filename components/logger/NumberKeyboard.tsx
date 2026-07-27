import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Delete } from 'lucide-react-native';

import type { Locale } from '../../lib/units';

interface NumberKeyboardProps {
  // Tampon canonique : toujours un point décimal, quelle que soit la locale.
  // La virgule française n'existe qu'à l'affichage (touche et rendu), jamais
  // dans la valeur — sinon `parseFloat` casse.
  value: string;
  locale: Locale;
  // Les reps sont des entiers : la touche décimale est désactivée, pas
  // masquée, pour que la grille ne bouge pas d'un champ à l'autre.
  allowDecimal: boolean;
  onChange: (nextValue: string) => void;
  onDone: () => void;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

// Clavier numérique custom sticky (LYXO_UI_PROMPT.md, ROADMAP 2.4). Custom
// plutôt que le clavier système : on maîtrise la disposition, on garde les
// steppers visibles au-dessus, et on évite que le clavier OS recouvre la
// ligne en cours d'édition — le geste le plus fréquent de l'app se fait
// d'une main, en salle.
export function NumberKeyboard({
  value,
  locale,
  allowDecimal,
  onChange,
  onDone,
}: NumberKeyboardProps) {
  const { t } = useTranslation();
  const decimalKey = locale === 'fr' ? ',' : '.';

  const appendDigit = (digit: string) => {
    // Évite "007" : un 0 initial est remplacé, sauf si on saisit "0,".
    const next = value === '0' ? digit : `${value}${digit}`;
    onChange(next);
  };

  const appendDecimal = () => {
    if (value.includes('.')) return;
    onChange(value === '' ? '0.' : `${value}.`);
  };

  const backspace = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <View className="border-t border-border bg-card px-4 pb-8 pt-4">
      {DIGIT_ROWS.map((row) => (
        <View key={row.join('')} className="flex-row">
          {row.map((digit) => (
            <Key key={digit} label={digit} onPress={() => appendDigit(digit)} />
          ))}
        </View>
      ))}

      <View className="flex-row">
        <Key label={decimalKey} disabled={!allowDecimal} onPress={appendDecimal} />
        <Key label="0" onPress={() => appendDigit('0')} />
        <Key label={t('workout.keyboard.backspace')} icon onPress={backspace} />
      </View>

      <Pressable
        onPress={onDone}
        className="mt-2 min-h-tap items-center justify-center rounded-2xl bg-ember"
      >
        <Text className="font-inter-semibold text-fg">{t('workout.keyboard.done')}</Text>
      </Pressable>
    </View>
  );
}

interface KeyProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: boolean;
}

// Mémoïsée : le tampon change à chaque frappe, mais les 12 touches, elles,
// ne changent jamais — inutile de les re-rendre à chaque chiffre saisi.
const Key = memo(function Key({ label, onPress, disabled, icon }: KeyProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // min-h-tap = 56px (LYXO_UI_PROMPT STRICT RULES #8) : cible tactile
      // atteignable au pouce, mains moites, en salle.
      className={`m-1 min-h-tap flex-1 items-center justify-center rounded-2xl ${
        disabled ? 'bg-input opacity-40' : 'bg-input'
      }`}
    >
      {icon ? (
        <Delete color="#F5F1EC" size={22} />
      ) : (
        <Text className="text-xl text-fg">{label}</Text>
      )}
    </Pressable>
  );
});
