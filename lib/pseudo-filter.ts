// Filtre de RECOMMANDATION (jamais un blocage dur) sur les pseudos —
// décision interview Q10 (CLAUDE_LYXO_V3 §19.1 : "recommandations/
// suggestions si pseudo problématique (liste FR/camfranglais), pas de
// blocage dur"), appliqué ici à l'écran 2bis (SECURITY_NOTES §2.3).
// Liste volontairement courte et non exhaustive (vulgarité/grossièretés
// courantes, pas une tentative de modération exhaustive — le
// signalement à posteriori reste le filet principal, §18.10).
const PROBLEMATIC_TERMS = [
  'merde', 'putain', 'connard', 'connasse', 'encul', 'batard', 'salope',
  'pute', 'nique', 'niquer', 'bite', 'couille', 'chier', 'foutre',
  'nyama', 'wolowoss', 'mbindi',
];

export function hasProblematicTerm(pseudo: string): boolean {
  const lower = pseudo.toLowerCase();
  return PROBLEMATIC_TERMS.some((term) => lower.includes(term));
}

// Suggestions neutres dérivées du pseudo saisi (pas d'ajout de suffixe
// portant sur le terme problématique lui-même) — même forme que
// backend/src/lib/username.ts::suggestUsernames pour rester cohérent
// visuellement avec l'écran 3, mais calculé côté client ici (pas de
// vérification d'unicité nécessaire, juste une reformulation neutre).
export function suggestNeutralPseudo(base: string): string[] {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 12);
  return [`${clean}_lift`, `lyxo_${clean}`];
}
