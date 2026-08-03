import type { Locale } from './units';

// Calculs purs du résumé peak-end — ROADMAP 2.11, LYXO_UI_PROMPT §5bis.
// Séparés de l'écran pour rester testables sans monter de composant React
// (même logique que `lib/rest-timer.ts`).

// "Vendredi", pas "vendredi" : LYXO_UI_PROMPT §5bis ("day names make it
// real") montre le jour capitalisé. `Intl` rend les noms de jour en
// minuscule en français — la capitalisation est donc appliquée ici, pas
// laissée à `Intl`.
export function dayLabel(date: Date, locale: Locale): string {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

// "45 min" en dessous d'une heure, "1 h 12" au-delà — jamais de secondes,
// une séance ne se mesure pas à la seconde près.
export function formatDurationLabel(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.round(durationMs / 60_000));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes}`;
}

// Delta de volume vs la séance précédente — `null` si aucune comparaison
// n'est possible (toute première séance terminée du profil).
export function volumeDeltaKg(totalVolumeKg: number, previousVolumeKg: number | null): number | null {
  if (previousVolumeKg === null) return null;
  return totalVolumeKg - previousVolumeKg;
}

// Regroupement des records PAR EXERCICE — refonte du 2026-08-03.
//
// Avant : une grande carte par record, empilées. Une séance battant 4 types
// sur un même exercice affichait donc son nom quatre fois d'affilée, dans
// quatre boîtes de ~160 px. C'est la RÉPÉTITION, pas le nombre de records,
// qui rendait l'écran interminable.
//
// L'ordre d'apparition des exercices suit celui du tableau `prs`, qui suit
// lui-même l'ordre des séries de la séance : on relit la séance dans l'ordre
// où on l'a vécue, pas dans un classement arbitraire.
export interface PRGroup<T> {
  exerciseId: string;
  prs: T[];
}

export function groupPRsByExercise<T extends { exerciseId: string }>(prs: T[]): PRGroup<T>[] {
  const groups: PRGroup<T>[] = [];
  const indexByExerciseId = new Map<string, number>();

  for (const pr of prs) {
    const existing = indexByExerciseId.get(pr.exerciseId);
    if (existing === undefined) {
      indexByExerciseId.set(pr.exerciseId, groups.length);
      groups.push({ exerciseId: pr.exerciseId, prs: [pr] });
      continue;
    }
    groups[existing]!.prs.push(pr);
  }

  return groups;
}
