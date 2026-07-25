// Traduction EN -> FR best-effort des noms d'exercices free-exercise-db.
//
// Les noms sources sont trop hétérogènes ("Barbell Curls Lying Against An
// Incline", "Bench Press - Medium Grip"...) pour une vraie réécriture
// grammaticale fiable en script. On fait donc une substitution lexicale
// (phrases connues d'abord, puis mots isolés) SANS réordonner la phrase :
// le résultat reste compréhensible pour un francophone du fitness mais pas
// toujours idiomatique. `needsReview` signale les noms à faire relire
// humainement (ROADMAP §18.10 prévoit déjà cette relecture).

// Phrases multi-mots, vérifiées avant les mots isolés (plus long = prioritaire).
const PHRASES: Record<string, string> = {
  'bench press': 'développé couché',
  'incline bench press': 'développé incliné',
  'decline bench press': 'développé décliné',
  'close-grip bench press': 'développé prise serrée',
  'close grip bench press': 'développé prise serrée',
  'shoulder press': 'développé épaules',
  'overhead press': 'développé militaire',
  'military press': 'développé militaire',
  'chest press': 'développé pectoraux',
  'leg press': 'presse à cuisses',
  'calf press': 'presse mollets',
  'leg curl': 'leg curl',
  'leg extension': 'leg extension',
  'lat pulldown': 'tirage vertical',
  'seated row': 'rowing assis',
  'bent-over row': 'rowing buste penché',
  'bent over row': 'rowing buste penché',
  'upright row': 'rowing menton',
  'face pull': 'face pull',
  'lateral raise': 'élévation latérale',
  'front raise': 'élévation frontale',
  'rear delt raise': 'élévation arrière épaules',
  'rear deltoid raise': 'élévation arrière épaules',
  'hip thrust': 'hip thrust',
  'glute bridge': 'pont fessier',
  'calf raise': 'élévation mollets',
  'good morning': 'good morning',
  'hack squat': 'hack squat',
  'front squat': 'squat avant',
  'back squat': 'squat arrière',
  'split squat': 'fente bulgare',
  'goblet squat': 'squat goblet',
  'romanian deadlift': 'soulevé de terre roumain',
  'sumo deadlift': 'soulevé de terre sumo',
  'stiff leg deadlift': 'soulevé de terre jambes tendues',
  'stiff-legged deadlift': 'soulevé de terre jambes tendues',
  'skull crusher': 'extension triceps au sol',
  'skull crushers': 'extension triceps au sol',
  'tricep extension': 'extension triceps',
  'triceps extension': 'extension triceps',
  'bicep curl': 'curl biceps',
  'biceps curl': 'curl biceps',
  'hammer curl': 'curl marteau',
  'preacher curl': 'curl pupitre',
  'concentration curl': 'curl concentré',
  'pull apart': "écarté à l'élastique",
  'pullover': 'pull-over',
  'push up': 'pompe',
  'push-up': 'pompe',
  'pushup': 'pompe',
  'pull up': 'traction',
  'pull-up': 'traction',
  'pullup': 'traction',
  'chin up': 'traction prise supination',
  'chin-up': 'traction prise supination',
  'chinup': 'traction prise supination',
  'sit up': 'redressement assis',
  'sit-up': 'redressement assis',
  'situp': 'redressement assis',
  'russian twist': 'rotation russe',
  'side bend': 'flexion latérale',
  'step up': 'step-up',
  'step-up': 'step-up',
  'kickback': 'kickback',
  'crossover': 'écarté croisé',
  'medium grip': 'prise moyenne',
  'wide grip': 'prise large',
  'wide-grip': 'prise large',
  'close grip': 'prise serrée',
  'close-grip': 'prise serrée',
  'reverse grip': 'prise inversée',
  'reverse-grip': 'prise inversée',
  'behind the neck': 'derrière la nuque',
  'behind neck': 'derrière la nuque',
  'with bands': 'avec élastique',
  'with chains': 'avec chaînes',
  'against an incline': 'sur banc incliné',
  'against incline': 'sur banc incliné',
  'ez-bar': 'barre EZ',
  'ez curl bar': 'barre EZ',
  'e-z-bar': 'barre EZ',
  'smith machine': 'machine Smith',
  'body only': 'poids du corps',
  'exercise ball': 'swiss ball',
  'stability ball': 'swiss ball',
  'swiss ball': 'swiss ball',
  'medicine ball': 'medicine ball',
  'trap bar': 'barre hexagonale',
  // formes plurielles des mouvements composés (sinon le "s" final finit
  // en résidu non traduit après la substitution de phrase)
  'push ups': 'pompe',
  'push-ups': 'pompe',
  'pull ups': 'traction',
  'pull-ups': 'traction',
  'chin ups': 'traction prise supination',
  'chin-ups': 'traction prise supination',
  'sit ups': 'redressement assis',
  'sit-ups': 'redressement assis',
};

// Mots isolés, appliqués après les phrases sur ce qu'il reste.
const WORDS: Record<string, string> = {
  // mouvements génériques (singulier + pluriel, la clé est le mot déjà nettoyé)
  row: 'rowing',
  rows: 'rowing',
  squat: 'squat',
  squats: 'squat',
  curl: 'curl',
  curls: 'curl',
  press: 'développé',
  presses: 'développé',
  raise: 'élévation',
  raises: 'élévation',
  extension: 'extension',
  extensions: 'extension',
  flexion: 'flexion',
  deadlift: 'soulevé de terre',
  deadlifts: 'soulevé de terre',
  dip: 'dips',
  dips: 'dips',
  fly: 'écarté',
  flye: 'écarté',
  flyes: 'écarté',
  crunch: 'crunch',
  crunches: 'crunch',
  plank: 'gainage',
  shrug: 'haussement d’épaules',
  shrugs: 'haussement d’épaules',
  lunge: 'fente',
  lunges: 'fente',
  swing: 'swing',
  swings: 'swing',
  clean: 'épaulé',
  jerk: 'jeté',
  snatch: 'arraché',
  twist: 'rotation',
  bridge: 'pont',
  rollout: 'rollout',
  windmill: 'moulinet',
  // équipement
  barbell: 'barre',
  dumbbell: 'haltère',
  dumbbells: 'haltères',
  cable: 'poulie',
  machine: 'machine',
  kettlebell: 'kettlebell',
  kettlebells: 'kettlebell',
  band: 'élastique',
  bands: 'élastique',
  plate: 'disque',
  // position / modificateurs
  seated: 'assis',
  standing: 'debout',
  lying: 'allongé',
  incline: 'incliné',
  inclined: 'incliné',
  decline: 'décliné',
  flat: 'à plat',
  alternating: 'en alternance',
  alternate: 'en alternance',
  single: 'unilatéral',
  assisted: 'assisté',
  weighted: 'lesté',
  underhand: 'prise supination',
  overhand: 'prise pronation',
  kneeling: 'à genoux',
  wide: 'large',
  narrow: 'serré',
  close: 'serré',
  reverse: 'inversé',
  arm: 'bras',
  arms: 'bras',
  leg: 'jambe',
  legs: 'jambes',
  one: 'un',
  grip: 'prise',
  // groupes musculaires (utilisés comme complément, ex. "curl biceps")
  bicep: 'biceps',
  biceps: 'biceps',
  tricep: 'triceps',
  triceps: 'triceps',
  calf: 'mollets',
  calves: 'mollets',
  chest: 'pectoraux',
  shoulder: 'épaule',
  shoulders: 'épaules',
  deltoid: 'deltoïde',
  glute: 'fessier',
  glutes: 'fessiers',
  hamstring: 'ischio-jambier',
  hamstrings: 'ischio-jambiers',
  quad: 'quadriceps',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  ab: 'abdominal',
  abs: 'abdominaux',
  abdominal: 'abdominal',
  abdominals: 'abdominaux',
  oblique: 'oblique',
  obliques: 'obliques',
  lat: 'dorsal',
  lats: 'dorsaux',
  trap: 'trapèze',
  traps: 'trapèzes',
  forearm: 'avant-bras',
  forearms: 'avant-bras',
  neck: 'nuque',
  hip: 'hanche',
  hips: 'hanches',
  wrist: 'poignet',
  ankle: 'cheville',
  back: 'dos',
  full: 'complet',
  half: 'demi',
  floor: 'au sol',
  bench: 'banc',
  cross: 'croisé',
  the: 'le',
  a: 'un',
  an: 'un',
  to: 'à',
  with: 'avec',
  and: 'et',
  or: 'ou',
  on: 'sur',
  in: 'en',
  from: 'depuis',
  behind: 'derrière',
  against: 'contre',
  apart: 'écarté',
};

const EQUIPMENT_PREFIXES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'kettlebell',
  'band',
  'ez-bar',
  'smith',
];

const phraseKeys = Object.keys(PHRASES).sort((a, b) => b.length - a.length);

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

export interface TranslationResult {
  nameFr: string;
  needsReview: boolean;
}

export function translateExerciseName(nameEn: string): TranslationResult {
  let working = nameEn.toLowerCase();
  // Qualificatifs entre parenthèses/après tiret ("- Medium Grip", "(On Knees)")
  // traités séparément : on les garde dans le flux à traduire mais on
  // force la relecture humaine, la ponctuation d'origine rendant la
  // substitution mot-à-mot peu fiable.
  const hasQualifier = /[()]|--|\s-\s/.test(working);
  working = working.replace(/[()]/g, ' ').replace(/--+/g, ' ').replace(/\//g, ' ');

  // Heuristique : "Barbell X" / "Dumbbell X" -> "X à la barre/aux haltères"
  // (le seul réordonnancement qu'on tente, car ce préfixe est fréquent et
  // sans ambiguïté).
  let trailingEquipment: string | null = null;
  for (const prefix of EQUIPMENT_PREFIXES) {
    const re = new RegExp(`^${prefix}s?\\b\\.?\\s+`);
    if (re.test(working)) {
      trailingEquipment = PHRASES[prefix] ?? WORDS[prefix] ?? prefix;
      working = working.replace(re, '');
      break;
    }
  }

  // Substitution par jetons opaques (@@n@@) plutôt qu'injection directe du
  // texte français : sinon un mot français substring d'un mot anglais (ex.
  // "presse" contient "press") fausse la détection "déjà traduit" plus bas.
  const placeholders: string[] = [];
  for (const phrase of phraseKeys) {
    if (working.includes(phrase)) {
      const idx = placeholders.length;
      placeholders.push(PHRASES[phrase]);
      working = working.split(phrase).join(` @@${idx}@@ `);
    }
  }

  const tokens = working.split(/[\s-]+/).filter(Boolean);
  let unmatched = 0;
  const translatedTokens = tokens.map((tok) => {
    const placeholderMatch = tok.match(/^@@(\d+)@@$/);
    if (placeholderMatch) return placeholders[Number(placeholderMatch[1])];
    const clean = tok.replace(/[^a-z]/g, '');
    if (!clean) return null;
    if (clean === 's' || clean === 'es') return null; // résidu pluriel après découpage de phrase
    const fr = WORDS[clean];
    if (fr) return fr;
    if (/^\d+$/.test(clean)) return tok; // nombres (ex. "3/4")
    unmatched += 1;
    return tok; // laissé en anglais, compté comme non traduit
  });

  let result = translatedTokens.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (trailingEquipment) {
    result = `${result} à la ${trailingEquipment}`.replace(/\s+/g, ' ').trim();
  }

  const needsReview = hasQualifier || unmatched > 0 || result.length === 0;

  return {
    nameFr: capitalize(result || nameEn),
    needsReview,
  };
}
