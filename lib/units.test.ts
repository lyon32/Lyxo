import { formatWeight, kgToLbs, lbsToKg, stepperIncrement, weightInputValue } from './units';

// TESTING.md §1.1 : `lib/units.ts` est en tests unitaires obligatoires —
// "erreur de conversion = mauvaise donnée affichée à vie si mal stockée".
// Une conversion fausse est indétectable à l'œil, d'où ces tests.

// Espace INSÉCABLE, écrite en échappement plutôt qu'en caractère littéral :
// U+00A0 et U+0020 sont indiscernables dans un éditeur, et un test qui
// échoue sur "100 kg" vs "100 kg" est impossible à diagnostiquer à l'œil.
const NBSP = '\u00A0';

describe('formatWeight', () => {
  it('formate les kg avec une virgule en français (§19.15)', () => {
    expect(formatWeight(82.5, 'kg', 'fr')).toBe(`82,5${NBSP}kg`);
  });

  it('convertit en lbs avec un point en anglais, sans traîner de décimales', () => {
    // L'exemple exact de CLAUDE_LYXO_V3 §19.15 : 82,5 kg → 181,9 lbs,
    // jamais 181.88155.
    expect(formatWeight(82.5, 'lbs', 'en')).toBe(`181.9${NBSP}lbs`);
  });

  it('traite locale et unité comme deux préférences indépendantes', () => {
    // Un francophone peut vouloir des lbs : virgule décimale ET unité lbs.
    expect(formatWeight(82.5, 'lbs', 'fr')).toBe(`181,9${NBSP}lbs`);
  });

  it('supprime le zéro décimal inutile', () => {
    expect(formatWeight(100, 'kg', 'fr')).toBe(`100${NBSP}kg`);
    expect(formatWeight(100, 'kg', 'en')).toBe(`100${NBSP}kg`);
  });

  it('groupe les milliers selon la locale', () => {
    // Espace insécable en français, virgule en anglais.
    expect(formatWeight(1250, 'kg', 'fr')).toBe(`1${NBSP}250${NBSP}kg`);
    expect(formatWeight(1250, 'kg', 'en')).toBe(`1,250${NBSP}kg`);
  });
});

describe('stepperIncrement', () => {
  it('propose un seul pas de 2,5 en kg', () => {
    expect(stepperIncrement('kg')).toEqual([2.5]);
  });

  it('propose 2.5 et 5 en lbs (plaques réelles US, §19.15)', () => {
    expect(stepperIncrement('lbs')).toEqual([2.5, 5]);
  });
});

describe('conversions', () => {
  it('fait un aller-retour kg → lbs → kg sans dérive perceptible', () => {
    // Garde-fou contre la dérive du kg stocké (TESTING.md §1.1).
    expect(lbsToKg(kgToLbs(82.5))).toBeCloseTo(82.5, 10);
  });
});

describe('weightInputValue', () => {
  it('rend la valeur nue, sans unité, pour un champ de saisie', () => {
    expect(weightInputValue(82.5, 'kg', 'fr')).toBe('82,5');
    expect(weightInputValue(82.5, 'lbs', 'en')).toBe('181.9');
  });
});
