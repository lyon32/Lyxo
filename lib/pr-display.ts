import type { IneligibilityReason } from './pr-detection';
import { formatWeight, type Locale, type WeightUnit } from './units';

// Mise en forme des records personnels pour l'affichage — fonctions PURES,
// séparées des composants et du hook pour rester testables sans monter de
// React ni d'adaptateur WatermelonDB (même parti pris que
// `lib/workout-summary.ts`).
//
// Les deux surfaces qui affichent un PR les utilisent : la modale de
// célébration (moment "peak", pendant la séance) et le bloc Records du
// résumé (moment "end"). Avoir une seule implémentation évite que les deux
// écrans divergent sur ce que vaut un record.

export interface DisplayablePR {
  type: 'weight' | 'volume' | 'reps' | '1rm';
  value: number;
  previousBest: number | null;
}

// Forme brute d'une ligne `personal_records`, sans dépendre du modèle
// WatermelonDB : c'est ce qui rend la fonction testable.
export interface PersonalRecordRow {
  exerciseId: string;
  prType: DisplayablePR['type'];
  weightKg: number;
  reps: number;
  estimated1RmKg: number | null;
  previousBest: number | null;
  isSocialEligible: boolean;
  // Type strict et non `string | null` : le motif d'inéligibilité est une
  // énumération fermée (§18.1), et l'élargir ici casserait `SessionPR`.
  ineligibilityReason: IneligibilityReason;
}

// La valeur AFFICHÉE d'un record dépend de son type : seule `weight_kg` est
// stockée, le volume et le 1RM se redérivent (DATA_MODEL §2.8 — une seule
// valeur canonique, tout le reste se recalcule à la lecture).
//
// ⚠️ `previousBest` est déjà dans la MÊME unité que la valeur dérivée : il
// vient de `DetectedPR.previousBest` (`lib/pr-detection.ts`), qui propage
// `previousBests.volumeKg` pour un PR de volume et `previousBests.
// estimated1RmKg` pour un 1RM. Les deux côtés de la soustraction sont donc
// homogènes par construction — ne jamais y stocker un poids brut.
export function personalRecordToSessionPR(row: PersonalRecordRow) {
  const value =
    row.prType === 'reps'
      ? row.reps
      : row.prType === 'volume'
        ? row.weightKg * row.reps
        : row.prType === '1rm'
          ? (row.estimated1RmKg ?? row.weightKg)
          : row.weightKg;

  return {
    exerciseId: row.exerciseId,
    type: row.prType,
    value,
    previousBest: row.previousBest,
    isSocialEligible: row.isSocialEligible,
    ineligibilityReason: row.ineligibilityReason,
  };
}

// "+2,5 kg" ou "+3" pour les répétitions — `null` quand il n'y a rien à
// annoncer, ce qui couvre deux cas distincts :
//   - `previousBest === null` : record inconnu (premier record sur cet
//     exercice, ou ligne antérieure au schéma v4) ;
//   - delta <= 0 : ne peut se produire que sur une ligne venue d'un autre
//     appareil dont l'historique différait — on n'affiche pas une
//     "progression" nulle ou négative sur un écran de célébration.
export function prDeltaLabel(
  pr: DisplayablePR,
  unit: WeightUnit,
  locale: Locale,
): string | null {
  if (pr.previousBest === null) return null;
  const delta = pr.value - pr.previousBest;
  if (delta <= 0) return null;
  return pr.type === 'reps' ? `+${Math.round(delta)}` : `+${formatWeight(delta, unit, locale)}`;
}
