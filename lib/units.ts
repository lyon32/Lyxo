// Conversion et formatage des poids — CLAUDE_LYXO_V3.md §19.15, LLD.md §3.3.
//
// ⚠️ RÈGLE ABSOLUE : `weight_kg` est TOUJOURS la valeur stockée et envoyée à
// l'API. Le kg est l'unité canonique — aucune colonne lbs, aucun stockage
// mixte. Les fonctions de ce module ne servent QU'À L'AFFICHAGE et à la
// saisie ; elles ne doivent jamais produire la valeur persistée autrement
// que via une conversion explicite vers kg au moment de l'enregistrement.
//
// Corollaire social : les comparaisons (leaderboard, Conquête, Trace) se
// font sur `weight_kg`, jamais sur la valeur affichée — un user lbs et un
// user kg s'affrontent sur la valeur canonique et chacun VOIT la sienne.

export type WeightUnit = 'kg' | 'lbs';
export type Locale = 'fr' | 'en';

export const KG_TO_LBS = 2.20462;

export function kgToLbs(weightKg: number): number {
  return weightKg * KG_TO_LBS;
}

export function lbsToKg(weightLbs: number): number {
  return weightLbs / KG_TO_LBS;
}

// Incréments réels des steppers, par unité (§19.15) : ±2,5 kg en mode kg ;
// ±2.5 et ±5 lbs en mode lbs, qui correspondent aux plaques réelles US.
// Retourne un tableau : le mode lbs propose deux pas, pas un seul.
export function stepperIncrement(unit: WeightUnit): number[] {
  return unit === 'kg' ? [2.5] : [2.5, 5];
}

// Sépare la locale (virgule/point, groupement des milliers) de l'unité :
// ce sont deux préférences indépendantes (§19.15) — un francophone peut
// très bien vouloir des lbs.
const SEPARATORS: Record<Locale, { decimal: string; thousands: string }> = {
  // Espace insécable pour les milliers en français, jamais une espace
  // ordinaire : "3 500" ne doit pas pouvoir se couper en fin de ligne.
  fr: { decimal: ',', thousands: ' ' },
  en: { decimal: '.', thousands: ',' },
};

// Arrondi à 1 décimale, sans zéro décimal inutile : "82,5 kg" mais "100 kg",
// jamais "100,0 kg" ni "181,88155 lbs".
function formatNumber(value: number, locale: Locale): string {
  const { decimal, thousands } = SEPARATORS[locale];
  const rounded = Math.round(value * 10) / 10;
  const [integerPart, decimalPart] = Math.abs(rounded).toFixed(1).split('.');

  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const sign = rounded < 0 ? '-' : '';
  return decimalPart === '0' ? `${sign}${grouped}` : `${sign}${grouped}${decimal}${decimalPart}`;
}

// Formate une valeur CANONIQUE en kg vers l'unité d'affichage choisie.
// L'espace avant l'unité est insécable : "82,5 kg" ne doit jamais se couper
// entre le nombre et son unité.
export function formatWeight(weightKg: number, unit: WeightUnit, locale: Locale): string {
  const value = unit === 'kg' ? weightKg : kgToLbs(weightKg);
  return `${formatNumber(value, locale)} ${unit}`;
}

// Même arrondi que l'affichage, mais sans l'unité — pour les champs de
// saisie, où afficher "82,5 kg" dans l'input empêcherait de taper.
export function weightInputValue(weightKg: number, unit: WeightUnit, locale: Locale): string {
  return formatNumber(unit === 'kg' ? weightKg : kgToLbs(weightKg), locale);
}
