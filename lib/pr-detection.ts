// Détection de PR + anti-triche — PRD §18.1, LLD.md §3.1.
//
// Pure functions : zéro effet de bord, zéro appel réseau — prennent un
// historique en entrée, retournent un verdict. Dupliqué côté serveur
// (services/pr-detection.service.ts, source de vérité finale) ; la version
// client ne sert qu'à l'affichage optimiste immédiat (célébrer un PR avant
// même la sync).
//
// ⚠️ Un PR est TOUJOURS enregistré dans personal_records (stats perso
// intactes) — seul `is_social_eligible` détermine sa visibilité
// leaderboard/Conquête/Trace (DATA_MODEL.md §2.8). `detectPRs` répond à
// "est-ce un record perso ?", `evaluatePRSocialEligibility` répond
// séparément à "peut-il être montré aux autres ?".

// 4 types de PR — DATA_MODEL.md §2.8 (`personal_records.pr_type`).
export type PRType = 'weight' | 'volume' | 'reps' | '1rm';

export interface SetPerformance {
  weightKg: number;
  reps: number;
}

// Meilleur existant pour chacun des 4 types, sur CET exercice. `null` = pas
// encore de record (première fois que l'exercice est loggé).
export interface PreviousBests {
  weightKg: number | null;
  volumeKg: number | null;
  reps: number | null;
  estimated1RmKg: number | null;
}

export interface DetectedPR {
  type: PRType;
  value: number;
  previousBest: number | null;
}

// Formule d'Epley — LLD §3.1 ne prescrit pas de formule précise ; Epley est
// retenue pour sa simplicité (pas de RPE saisi dans l'app) et son usage
// dominant dans les apps de suivi de force. reps <= 1 : le poids soulevé
// EST le 1RM, la formule ne s'applique qu'au-delà.
export function estimatedOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function computeVolumeKg(set: SetPerformance): number {
  return set.weightKg * set.reps;
}

// Détecte, pour UN set, quels type(s) de PR il bat. Un même set peut battre
// plusieurs types à la fois (ex: poids max ET 1RM estimé). Strictement
// supérieur au record existant : égaler un record n'est pas le battre.
//
// ⚠️ `reps` est le nombre de répétitions maximum toutes charges confondues
// sur l'exercice, pas "à charge égale" — LLD §3.1 ne détaille pas cette
// nuance ; à revoir si le produit veut un PR reps par palier de charge.
export function detectPRs(set: SetPerformance, previousBests: PreviousBests): DetectedPR[] {
  const detected: DetectedPR[] = [];
  const volumeKg = computeVolumeKg(set);
  const estimated1Rm = estimatedOneRepMax(set.weightKg, set.reps);

  if (previousBests.weightKg === null || set.weightKg > previousBests.weightKg) {
    detected.push({ type: 'weight', value: set.weightKg, previousBest: previousBests.weightKg });
  }
  if (previousBests.volumeKg === null || volumeKg > previousBests.volumeKg) {
    detected.push({ type: 'volume', value: volumeKg, previousBest: previousBests.volumeKg });
  }
  if (previousBests.reps === null || set.reps > previousBests.reps) {
    detected.push({ type: 'reps', value: set.reps, previousBest: previousBests.reps });
  }
  if (previousBests.estimated1RmKg === null || estimated1Rm > previousBests.estimated1RmKg) {
    detected.push({ type: '1rm', value: estimated1Rm, previousBest: previousBests.estimated1RmKg });
  }
  return detected;
}

export interface PRCandidate {
  exerciseId: string;
  weightKg: number;
  reps: number;
  achievedAt: Date;
}

export interface PRHistoryContext {
  bodyWeightKg: number | null; // null si jamais renseigné
  previousBestKg: number | null; // meilleur PR précédent sur CET exercice
  sessionsLoggedOnExercise: number; // séances distinctes ayant utilisé cet exercice
}

export type IneligibilityReason =
  | 'implausible_weight' // > 4× bodyWeightKg
  | 'delta_too_high' // > +15% vs previousBestKg
  | 'insufficient_history' // < 3 séances loggées sur l'exercice
  | null;

// Anti-triche §18.1 — un PR reste toujours vrai pour son auteur (stats
// perso), cette fonction décide seulement s'il est montrable aux autres
// (leaderboard/Conquête/Trace). Ordre de vérification fixé par LLD §3.1 :
// plausibilité > delta > ancienneté.
export function evaluatePRSocialEligibility(
  candidate: PRCandidate,
  context: PRHistoryContext,
): { isSocialEligible: boolean; reason: IneligibilityReason } {
  if (context.bodyWeightKg !== null && candidate.weightKg > context.bodyWeightKg * 4) {
    return { isSocialEligible: false, reason: 'implausible_weight' };
  }

  if (context.previousBestKg !== null && context.previousBestKg > 0) {
    const deltaRatio = (candidate.weightKg - context.previousBestKg) / context.previousBestKg;
    if (deltaRatio > 0.15) {
      return { isSocialEligible: false, reason: 'delta_too_high' };
    }
  }

  if (context.sessionsLoggedOnExercise < 3) {
    return { isSocialEligible: false, reason: 'insufficient_history' };
  }

  return { isSocialEligible: true, reason: null };
}
