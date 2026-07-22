// Regex restrictive : alphanumérique + underscore, longueur bornée
// (SECURITY_NOTES.md §2.2). Minuscules uniquement — évite les collisions
// d'unicité liées à la casse sur `profiles.username` (index simple, pas
// de citext).
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_REGEX.test(value);
}

export function suggestUsernames(base: string): string[] {
  const clean = base.slice(0, 15).replace(/[^a-z0-9_]/g, '');
  return [`${clean}_lift`, `${clean}${Math.floor(100 + Math.random() * 900)}`];
}
