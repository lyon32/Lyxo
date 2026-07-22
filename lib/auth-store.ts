import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';

import { pushOnboardingChoicesIfAny } from './push-onboarding-choices';
import { supabase } from './supabase';

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
    });

    supabase.auth.onAuthStateChange((event, session) => {
      set({ status: session ? 'signed-in' : 'signed-out' });
      if (event === 'SIGNED_IN') {
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

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
    return { error: exchangeError, cancelled: false };
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
