import { useEffect, useState } from 'react';

import { getStoredLanguage } from './onboarding-storage';

export type OnboardingGateStatus = 'checking' | 'needs-onboarding' | 'ready';

// Tant qu'aucune session réelle n'existe (auth arrive à la tâche 1.6),
// le seul critère de "premier lancement" est le choix de langue jamais
// fait — le vrai gate d'authentification (session Supabase) remplacera
// ce chèque une fois 1.6 livré.
export function useOnboardingGate(): OnboardingGateStatus {
  const [status, setStatus] = useState<OnboardingGateStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    getStoredLanguage().then((language) => {
      if (cancelled) return;
      setStatus(language ? 'ready' : 'needs-onboarding');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
