import { useEffect, useState } from 'react';

import { useAuthStore } from './auth-store';
import { getStoredLanguage } from './onboarding-storage';

export type OnboardingGateStatus = 'checking' | 'needs-onboarding' | 'needs-auth' | 'ready';

// Gate racine réel (remplace la version temporaire de la tâche 1.5bis) :
// langue jamais choisie → onboarding pré-auth ; langue choisie mais pas
// de session Supabase → auth ; sinon → tabs.
export function useOnboardingGate(): OnboardingGateStatus {
  const authStatus = useAuthStore((s) => s.status);
  const [languageStatus, setLanguageStatus] = useState<'checking' | 'missing' | 'present'>(
    'checking',
  );

  useEffect(() => {
    let cancelled = false;
    getStoredLanguage().then((language) => {
      if (!cancelled) setLanguageStatus(language ? 'present' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (languageStatus === 'checking' || authStatus === 'loading') return 'checking';
  if (languageStatus === 'missing') return 'needs-onboarding';
  if (authStatus === 'signed-out') return 'needs-auth';
  return 'ready';
}
