import geoip from 'geoip-lite';

// Lookup offline (base embarquée geoip-lite, pas d'appel réseau externe ni
// de clé API) — précision pays uniquement, suffisant pour un signal de
// CONFIRMATION (BILLING_FLOW.md §2 : jamais seule décisive contre le pays
// déclaré). Retourne null pour localhost/IP privée en dev.
export function lookupCountryFromIp(ip: string): string | null {
  const result = geoip.lookup(ip);
  return result?.country ?? null;
}
