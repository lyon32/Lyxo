import 'react-native-url-polyfill/auto';
import './webcrypto-polyfill';

import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Session (JWT + refresh token) : SecureStore obligatoire (Keystore Android /
// Keychain iOS), jamais AsyncStorage en clair — SECURITY_NOTES.md §3bis.1
// (OWASP M9 : lisible sinon sur un device rooté ou via backup ADB).
const secureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // La redirection OAuth passe par expo-web-browser (lib/auth-store.ts),
    // pas par un parsing d'URL web — jamais pertinent en React Native.
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
