import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';

import { pushOnboardingChoicesIfAny } from './push-onboarding-choices';
import { supabase } from './supabase';

// Identité localement mise en cache (SecureStore, comme le JWT lui-même) —
// distincte de `getSession()`, qui reste réservé aux appels API réellement
// authentifiés. Raison complète dans `db/use-active-workout.ts`
// (`currentProfileId`) : `getSession()` peut renvoyer une session VIDE hors
// ligne si le token est expiré (le rafraîchissement réseau qu'il tente
// échoue), alors que l'identité d'un profil déjà connecté ne change pas et
// n'a aucune raison d'être reconfirmée en réseau pour une écriture purement
// locale (WatermelonDB).
const CACHED_PROFILE_ID_KEY = 'lyxo-cached-profile-id';

export async function getCachedProfileId(): Promise<string | null> {
  return SecureStore.getItemAsync(CACHED_PROFILE_ID_KEY);
}

async function cacheProfileId(userId: string | null): Promise<void> {
  if (userId) {
    await SecureStore.setItemAsync(CACHED_PROFILE_ID_KEY, userId);
  } else {
    await SecureStore.deleteItemAsync(CACHED_PROFILE_ID_KEY);
  }
}

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

interface AuthState {
  status: AuthStatus;
  bootstrap: () => void;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null; cancelled: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

let bootstrapped = false;

// Session : Supabase gère la persistance/refresh du JWT (AsyncStorage,
// lib/supabase.ts) — ce store ne fait que refléter l'état pour l'UI
// (LLD.md §4, useAuthStore).
export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',

  bootstrap: () => {
    if (bootstrapped) return;
    bootstrapped = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ status: session ? 'signed-in' : 'signed-out' });
      cacheProfileId(session?.user.id ?? null);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      set({ status: session ? 'signed-in' : 'signed-out' });
      cacheProfileId(session?.user.id ?? null);
      if (event === 'SIGNED_IN') {
        // billing_region n'est PLUS recalculé ici (BILLING_FLOW.md §2 :
        // "jamais recalculée en douce") — le vrai déclencheur unique est
        // désormais la soumission de l'écran 2bis (lib/compute-billing-
        // region.ts, ROADMAP 1.8).
        pushOnboardingChoicesIfAny();
      }
    });
  },

  signUpWithEmail: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // raw_user_meta_data : chemin optimisé pour l'email (trigger DB),
      // le PATCH post-login reste le chemin universel (OAuth compris).
      options: { data: { username } },
    });
    // PRD 3.1 : confirmation email désactivée en V1 (réglage Supabase
    // Dashboard, manuel — pas encore configuré tant que ce n'est pas fait,
    // signUp renvoie alors un user sans session).
    return { error, needsEmailConfirmation: !error && !data.session };
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },

  signInWithGoogle: async () => {
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { error, cancelled: false };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      // Annulation (retour sur la feuille système Google) — jamais une
      // erreur affichée (UI prompt écran 3ter).
      return { error: null, cancelled: true };
    }

    // Le deep link peut AUSSI atteindre app/auth/callback.tsx en parallèle
    // (interception navigateur pas fiable sur tous les Android) — code
    // PKCE à usage unique, donc si ce chemin perd la course, une session
    // existe déjà via l'autre : pas une vraie erreur dans ce cas.
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
    if (!exchangeError) return { error: null, cancelled: false };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { error: session ? null : exchangeError, cancelled: false };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  sendPasswordReset: async (email) => {
    const redirectTo = Linking.createURL('auth/reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  },
}));
