import AsyncStorage from '@react-native-async-storage/async-storage';

// Opt-in Gym Matching (LLD.md §6.8, ROADMAP.md Phase 5bis) — persisté comme
// le pattern home_tip_dismissed. Pas encore de toggle Réglages réel (Settings
// n'existe pas), donc pas de retour en arrière possible depuis l'UI pour
// l'instant — juste le premier "Commencer".
const DISCOVER_OPTED_IN_KEY = 'discover_opted_in';

export async function getDiscoverOptedIn(): Promise<boolean> {
  return (await AsyncStorage.getItem(DISCOVER_OPTED_IN_KEY)) === 'true';
}

export async function setDiscoverOptedIn(): Promise<void> {
  await AsyncStorage.setItem(DISCOVER_OPTED_IN_KEY, 'true');
}
