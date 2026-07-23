import 'react-native-url-polyfill/auto';
import './webcrypto-polyfill';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // La redirection OAuth passe par expo-web-browser (lib/auth-store.ts),
    // pas par un parsing d'URL web — jamais pertinent en React Native.
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
