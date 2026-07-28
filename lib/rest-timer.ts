// Calculs PURS du rest timer — PRD §1.2, LYXO_UI_PROMPT §6 (correctif #56).
//
// Volontairement séparés de `lib/rest-timer-store.ts` : celui-ci importe
// AsyncStorage, donc un module natif, ce qui rend le fichier intestable sous
// jest. Ces fonctions-là n'ont aucune dépendance et sont couvertes par
// `lib/rest-timer.test.ts`.
//
// ⚠️ `now` est TOUJOURS injecté, jamais lu depuis `Date.now()` à l'intérieur :
// c'est ce qui rend le comportement en arrière-plan réellement testable.

// Secondes restantes, jamais négatives. Arrondi AU-DESSUS pour ne pas afficher
// 0 alors qu'il reste une fraction de seconde.
export function remainingSeconds(endsAt: number | null, now: number): number {
  if (endsAt === null) return 0;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

// Proportion de repos ÉCOULÉE, de 0 à 1 — l'anneau se vide avec le temps
// (LYXO_UI_PROMPT §6 : "ring drains with time").
export function elapsedRatio(
  endsAt: number | null,
  totalDurationSecs: number,
  now: number,
): number {
  if (endsAt === null || totalDurationSecs <= 0) return 0;
  const remaining = remainingSeconds(endsAt, now);
  const ratio = 1 - remaining / totalDurationSecs;
  return Math.min(1, Math.max(0, ratio));
}

// Un ±15 s ne doit jamais produire un `endsAt` dans le passé : une
// notification programmée à une date écoulée ne serait jamais délivrée.
export function clampedEndsAt(currentEndsAt: number, deltaSecs: number, now: number): number {
  return Math.max(now, currentEndsAt + deltaSecs * 1000);
}
