import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { supabase } from './supabase';

// Coupe le rafraîchissement automatique du JWT (`autoRefreshToken`) quand
// l'app est en arrière-plan OU hors ligne — DoD ROADMAP 2.12 (mode avion).
//
// Sans ça, `autoRefreshToken: true` (lib/supabase.ts) fait retenter
// supabase-js en boucle sur un DNS qui ne résout jamais en mode avion : le
// device de test a produit des dizaines d'exceptions identiques
// ("UnknownHostException") en quelques minutes lors du DoD du 2026-07-30 —
// batterie/CPU gaspillés sur un device bas de gamme pour rien, et Sentry
// pollué d'erreurs non actionnables.
//
// Deux signaux, pas un seul : `AppState` seul ne suffit pas (l'app reste
// "active" en mode avion, au premier plan, juste sans réseau) ; `NetInfo`
// seul ne suffit pas non plus (une app en arrière-plan avec réseau n'a pas
// besoin de rafraîchir un token qu'aucun appel n'utilise).
let isForeground = AppState.currentState === 'active';
let isConnected = true;

function syncAutoRefresh() {
  if (isForeground && isConnected) {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
}

let started = false;

export function startSupabaseAutoRefreshGating(): void {
  if (started) return;
  started = true;

  AppState.addEventListener('change', (state) => {
    isForeground = state === 'active';
    syncAutoRefresh();
  });

  NetInfo.addEventListener((state) => {
    isConnected = state.isConnected ?? false;
    syncAutoRefresh();
  });
}
