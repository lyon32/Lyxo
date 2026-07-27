import AsyncStorage from '@react-native-async-storage/async-storage';

// Bandeau conseil dismissible (LLD.md §6.2) : persisté comme le pattern
// onboarding_offline_shown (CLAUDE_LYXO_V3.md) — ne réapparaît pas une fois fermé.
const TIP_DISMISSED_KEY = 'home_tip_dismissed';

export async function getHomeTipDismissed(): Promise<boolean> {
  return (await AsyncStorage.getItem(TIP_DISMISSED_KEY)) === 'true';
}

export async function setHomeTipDismissed(): Promise<void> {
  await AsyncStorage.setItem(TIP_DISMISSED_KEY, 'true');
}
