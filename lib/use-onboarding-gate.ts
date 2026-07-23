import { useEffect, useState } from 'react';

import { apiFetch } from './api-client';
import { useAuthStore } from './auth-store';
import { getStoredLanguage } from './onboarding-storage';

export type OnboardingGateStatus =
  | 'checking'
  | 'needs-onboarding'
  | 'needs-auth'
  | 'needs-post-auth'
  | 'ready';

// Gate racine réel : langue jamais choisie → onboarding pré-auth ; langue
// choisie mais pas de session Supabase → auth ; session mais pays jamais
// déclaré (profiles.country toujours NULL) → onboarding POST-auth (écran
// 2bis, ROADMAP 1.8) ; sinon → tabs.
//
// Pas de reset synchrone de postAuthStatus au changement d'authStatus :
// ce hook n'est monté que par (tabs)/_layout.tsx, qui démonte au premier
// 'needs-auth' (router.replace('/auth') quitte le groupe de routes
// "(tabs)") — une reconnexion ultérieure remonte le hook et repart donc
// naturellement de l'état initial 'checking'.
export function useOnboardingGate(): OnboardingGateStatus {
  const authStatus = useAuthStore((s) => s.status);
  const [languageStatus, setLanguageStatus] = useState<'checking' | 'missing' | 'present'>(
    'checking',
  );
  const [postAuthStatus, setPostAuthStatus] = useState<'checking' | 'needed' | 'done'>('checking');

  useEffect(() => {
    let cancelled = false;
    getStoredLanguage().then((language) => {
      if (!cancelled) setLanguageStatus(language ? 'present' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authStatus !== 'signed-in') return;

    let cancelled = false;

    apiFetch('/v1/profiles/me')
      .then((response) => response.json())
      .then((profile) => {
        if (!cancelled) setPostAuthStatus(profile?.country ? 'done' : 'needed');
      })
      .catch(() => {
        // Fail-open : une panne réseau/backend ne doit jamais bloquer
        // l'accès à l'app déjà installée (offline-first) — au pire
        // l'écran 2bis sera proposé au prochain login réussi.
        if (!cancelled) setPostAuthStatus('done');
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  if (languageStatus === 'checking' || authStatus === 'loading') return 'checking';
  if (languageStatus === 'missing') return 'needs-onboarding';
  if (authStatus === 'signed-out') return 'needs-auth';
  if (postAuthStatus === 'checking') return 'checking';
  if (postAuthStatus === 'needed') return 'needs-post-auth';
  return 'ready';
}
