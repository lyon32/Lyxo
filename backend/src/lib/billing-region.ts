import { AFRICA_MOMO_COUNTRIES } from '../config/billing-regions';

export type BillingRegion = 'africa_momo' | 'intl_iap';

export interface BillingRegionResult {
  billingRegion: BillingRegion;
  // Pays déclaré et IP en désaccord — le déclaré gagne toujours, mais
  // l'écart doit être loggé pour revue (BILLING_FLOW.md §2). Fonction
  // pure : c'est à l'appelant de logger, pas à elle (CONVENTIONS §5.3).
  conflict: boolean;
}

function regionFor(country: string | null): BillingRegion {
  return country && (AFRICA_MOMO_COUNTRIES as readonly string[]).includes(country)
    ? 'africa_momo'
    : 'intl_iap';
}

// Ordre de priorité (BILLING_FLOW.md §2) : 1) pays déclaré à l'onboarding
// 2) IP de la première session, en confirmation seulement — jamais seule
// décisive contre le déclaré (VPN fréquents).
export function computeBillingRegion(
  declaredCountry: string | null,
  ipCountry: string | null,
): BillingRegionResult {
  if (declaredCountry) {
    return {
      billingRegion: regionFor(declaredCountry),
      conflict: ipCountry !== null && ipCountry !== declaredCountry,
    };
  }

  return { billingRegion: regionFor(ipCountry), conflict: false };
}
